const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function expandEnvTemplate(value) {
  if (!value) {
    return value;
  }

  return value.replace(/\$\{([A-Z0-9_]+)(:-([^}]*))?\}/gi, (_, name, _segment, fallback) => {
    const resolved = process.env[name];
    return resolved && resolved.length > 0 ? resolved : fallback ?? "";
  });
}

function normalizeDatabaseUrl() {
  const rawValue = expandEnvTemplate(process.env.DATABASE_URL);
  const dbHost = process.env.SERVICE_NAME_DB || "db";
  const dbPort = process.env.DB_PORT || "3306";
  const dbName = process.env.DB_NAME || "ubon_health";
  const dbPassword = process.env.DB_ROOT_PASSWORD || "12345678";
  const fallback = `mysql://root:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

  if (!rawValue) {
    process.env.DATABASE_URL = fallback;
    return;
  }

  let nextValue = rawValue;

  if (nextValue.includes("host.docker.internal")) {
    nextValue = nextValue.replace(/host\.docker\.internal/gi, dbHost);
  }

  if (/\$\{[A-Z0-9_]+(?::-.*)?\}/i.test(nextValue)) {
    nextValue = expandEnvTemplate(nextValue);
  }

  process.env.DATABASE_URL = nextValue || fallback;
}

function normalizeNextAuthUrl() {
  const current = expandEnvTemplate(process.env.NEXTAUTH_URL)?.trim();
  if (current && !/^https?:\/\/localhost(?::\d+)?\/?$/i.test(current)) {
    process.env.NEXTAUTH_URL = current.replace(/\/+$/, "");
    return;
  }

  const coolifyUrls = (process.env.COOLIFY_URL || "")
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  const preferredUrl =
    coolifyUrls.find((value) => value.startsWith("https://") && !value.includes("sslip.io")) ||
    coolifyUrls.find((value) => value.startsWith("https://")) ||
    coolifyUrls.find((value) => value.startsWith("http://"));

  if (preferredUrl) {
    process.env.NEXTAUTH_URL = preferredUrl;
    return;
  }

  const appPort = process.env.PORT || process.env.APP_PORT || "3010";
  process.env.NEXTAUTH_URL = `http://localhost:${appPort}`;
}

function normalizeNextAuthSecret() {
  const current = expandEnvTemplate(process.env.NEXTAUTH_SECRET)?.trim();
  if (current) {
    process.env.NEXTAUTH_SECRET = current;
    return;
  }

  const seed = [
    process.env.COOLIFY_RESOURCE_UUID,
    process.env.COOLIFY_FQDN,
    process.env.NEXTAUTH_URL,
    "ubon-health-insights",
  ]
    .filter(Boolean)
    .join("|");

  process.env.NEXTAUTH_SECRET = crypto.createHash("sha256").update(seed).digest("hex");
}

function normalizeRuntimeEnvironment() {
  process.env.PORT = process.env.PORT || process.env.APP_PORT || "3010";
  process.env.AUTH_TRUST_HOST = process.env.AUTH_TRUST_HOST || "true";

  normalizeDatabaseUrl();
  normalizeNextAuthUrl();
  normalizeNextAuthSecret();

  console.log("Normalized runtime environment:", {
    DATABASE_URL: process.env.DATABASE_URL?.replace(/:(?:[^:@/]+)@/, ":****@"),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "[set]" : "[missing]",
    PORT: process.env.PORT,
  });
}

normalizeRuntimeEnvironment();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function runNodeScript(args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${label} exited with signal ${signal}`));
        return;
      }

      if ((code ?? 1) !== 0) {
        reject(new Error(`${label} exited with code ${code}`));
        return;
      }

      resolve();
    });
  });
}

function thaiMonthName(month) {
  const names = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  return names[month - 1];
}

function gregorianYearForFiscalMonth(fiscalYear, month) {
  return month >= 10 ? fiscalYear - 543 : fiscalYear - 542;
}

function quarterForMonth(month) {
  if (month >= 10) return 1;
  if (month >= 1 && month <= 3) return 2;
  if (month >= 4 && month <= 6) return 3;
  return 4;
}

function endOfMonth(year, month) {
  return new Date(Date.UTC(year, month, 0));
}

async function ensureFiscalPeriods(fiscalYear) {
  for (let month = 1; month <= 12; month += 1) {
    const gregorianYear = gregorianYearForFiscalMonth(fiscalYear, month);
    const startDate = new Date(Date.UTC(gregorianYear, month - 1, 1));
    const endDate = endOfMonth(gregorianYear, month);

    await prisma.fiscalPeriod.upsert({
      where: {
        fiscalYear_quarter_month: {
          fiscalYear,
          quarter: quarterForMonth(month),
          month,
        },
      },
      update: {
        monthNameTh: thaiMonthName(month),
        startDate,
        endDate,
      },
      create: {
        fiscalYear,
        quarter: quarterForMonth(month),
        month,
        monthNameTh: thaiMonthName(month),
        startDate,
        endDate,
      },
    });
  }
}

async function importTransferSeed() {
  const seedPath = path.join(process.cwd(), "data", "transfer-seed.json");
  if (!fs.existsSync(seedPath)) {
    console.log(`Transfer seed not found at ${seedPath}, skipping import.`);
    return;
  }

  const payload = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const fiscalYear = payload?.fiscalPeriod?.fiscalYear;
  const month = payload?.fiscalPeriod?.month;
  if (!fiscalYear || !month) {
    throw new Error("Invalid transfer seed metadata");
  }

  await ensureFiscalPeriods(fiscalYear);

  const period = await prisma.fiscalPeriod.findUnique({
    where: {
      fiscalYear_quarter_month: {
        fiscalYear,
        quarter: quarterForMonth(month),
        month,
      },
    },
  });

  if (!period) {
    throw new Error(`Fiscal period not found for fiscal year ${fiscalYear}, month ${month}`);
  }

  let createdUnits = 0;
  let updatedUnits = 0;

  for (const item of payload.units) {
    const amphoe = await prisma.dimAmphoe.upsert({
      where: { code: item.amphoe.code },
      update: { nameTh: item.amphoe.nameTh },
      create: {
        code: item.amphoe.code,
        nameTh: item.amphoe.nameTh,
      },
    });

    let tambonId = null;
    if (item.tambon?.code && item.tambon?.nameTh) {
      const tambon = await prisma.dimTambon.upsert({
        where: { code: item.tambon.code },
        update: {
          amphoeId: amphoe.id,
          nameTh: item.tambon.nameTh,
        },
        create: {
          code: item.tambon.code,
          amphoeId: amphoe.id,
          nameTh: item.tambon.nameTh,
        },
      });
      tambonId = tambon.id;
    }

    const data = {
      name: item.name,
      shortName: item.shortName,
      amphoeId: amphoe.id,
      tambonId,
      moo: item.moo,
      affiliation: item.affiliation,
      email: item.email,
      phone: item.phone,
      transferYear: item.transferYear,
      unitSize: item.unitSize,
      cupCode: item.cupCode,
      cupName: item.cupName,
      localAuthority: item.localAuthority,
      province: item.province,
      ucPopulation66: item.ucPopulation66,
      ucPopulation67: item.ucPopulation67,
      ucPopulation68: item.ucPopulation68,
      templeCount: item.templeCount ?? 0,
      primarySchoolCount: item.primarySchoolCount ?? 0,
      opportunitySchoolCount: item.opportunitySchoolCount ?? 0,
      secondarySchoolCount: item.secondarySchoolCount ?? 0,
      childDevelopmentCenterCount: item.childDevelopmentCenterCount ?? 0,
      healthStationCount: item.healthStationCount ?? 0,
      status: "active",
      isDeleted: false,
    };

    const existing = await prisma.healthUnit.findUnique({
      where: { code: item.code },
    });

    const healthUnit = existing
      ? await prisma.healthUnit.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.healthUnit.create({
          data: {
            code: item.code,
            ...data,
          },
        });

    if (existing) {
      updatedUnits += 1;
    } else {
      createdUnits += 1;
    }

    if (item.demographics) {
      await prisma.healthUnitDemographic.upsert({
        where: {
          healthUnitId_fiscalPeriodId: {
            healthUnitId: healthUnit.id,
            fiscalPeriodId: period.id,
          },
        },
        update: item.demographics,
        create: {
          healthUnitId: healthUnit.id,
          fiscalPeriodId: period.id,
          ...item.demographics,
        },
      });
    }
  }

  console.log(
    `Transfer seed import complete: ${payload.units.length} rows, ${createdUnits} created, ${updatedUnits} updated.`,
  );
}

async function bootstrap() {
  console.log("Running prisma db push...");
  await runNodeScript(["node_modules/prisma/build/index.js", "db", "push", "--skip-generate"], "prisma db push");

  console.log("Importing production seed data...");
  await importTransferSeed();
}

async function main() {
  try {
    await bootstrap();
  } catch (error) {
    console.error("Production bootstrap failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main();
