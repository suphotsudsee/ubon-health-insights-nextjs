const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_PUBLIC_URL = "https://coolify.phoubon.in.th";

function isEnabled(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

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

function isLocalhostUrl(value) {
  return /^https?:\/\/localhost(?::\d+)?\/?$/i.test(value);
}

function isIpUrl(value) {
  try {
    const url = new URL(value);
    return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(url.hostname);
  } catch {
    return false;
  }
}

function normalizePublicUrl(value) {
  const nextValue = value?.trim().replace(/\/+$/, "");
  if (!nextValue) {
    return null;
  }

  if (/^https?:\/\//i.test(nextValue)) {
    return nextValue;
  }

  return `https://${nextValue}`;
}

function normalizeNextAuthUrl() {
  const current = normalizePublicUrl(expandEnvTemplate(process.env.NEXTAUTH_URL));
  if (current && !isLocalhostUrl(current) && !isIpUrl(current)) {
    process.env.NEXTAUTH_URL = current.replace(/\/+$/, "");
    return;
  }

  const coolifyUrls = [
    process.env.COOLIFY_URL,
    process.env.COOLIFY_FQDN,
    DEFAULT_PUBLIC_URL,
  ]
    .filter(Boolean)
    .join(",")
    .split(",")
    .map(normalizePublicUrl)
    .filter(Boolean);

  const preferredUrl =
    coolifyUrls.find((value) => value.startsWith("https://") && !value.includes("sslip.io")) ||
    coolifyUrls.find((value) => value.startsWith("https://")) ||
    coolifyUrls.find((value) => value.startsWith("http://"));

  if (preferredUrl) {
    process.env.NEXTAUTH_URL = preferredUrl;
    return;
  }

  process.env.NEXTAUTH_URL = DEFAULT_PUBLIC_URL;
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
  process.env.BOOTSTRAP_SEED = process.env.BOOTSTRAP_SEED || "true";
  process.env.BOOTSTRAP_ADMIN = process.env.BOOTSTRAP_ADMIN || "true";

  normalizeDatabaseUrl();
  normalizeNextAuthUrl();
  normalizeNextAuthSecret();

  console.log("Normalized runtime environment:", {
    DATABASE_URL: process.env.DATABASE_URL?.replace(/:(?:[^:@/]+)@/, ":****@"),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "[set]" : "[missing]",
    PORT: process.env.PORT,
    BOOTSTRAP_SEED: process.env.BOOTSTRAP_SEED,
    BOOTSTRAP_ADMIN: process.env.BOOTSTRAP_ADMIN,
  });
}

normalizeRuntimeEnvironment();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function ensureUtf8mb4Encoding() {
  const dbName = process.env.DB_NAME || "ubon_health";
  const targetCharset = "utf8mb4";
  const targetCollation = "utf8mb4_unicode_ci";

  console.log(`Ensuring ${dbName} uses ${targetCharset}/${targetCollation}...`);

  await prisma.$executeRawUnsafe(
    `ALTER DATABASE \`${dbName}\` CHARACTER SET ${targetCharset} COLLATE ${targetCollation}`,
  );

  const tables = await prisma.$queryRawUnsafe(`
    SELECT TABLE_NAME AS tableName
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = ?
      AND TABLE_TYPE = 'BASE TABLE'
  `, dbName);

  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE \`${table.tableName}\` CONVERT TO CHARACTER SET ${targetCharset} COLLATE ${targetCollation}`,
    );
  }
}

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

async function tableExists(tableName) {
  const dbName = process.env.DB_NAME || "ubon_health";
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT 1
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
      LIMIT 1
    `,
    dbName,
    tableName,
  );

  return Array.isArray(rows) && rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const dbName = process.env.DB_NAME || "ubon_health";
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    dbName,
    tableName,
    columnName,
  );

  return Array.isArray(rows) && rows.length > 0;
}

async function normalizeFinanceAccountCodesBeforeDbPush() {
  const hasFinanceAccounts = await tableExists("finance_accounts");
  if (!hasFinanceAccounts) {
    return;
  }

  const hasAccountCode = await columnExists("finance_accounts", "account_code");
  if (!hasAccountCode) {
    console.log("finance_accounts.account_code does not exist yet, skipping preflight duplicate check.");
    return;
  }

  await prisma.$executeRawUnsafe(`
    UPDATE finance_accounts
    SET account_code = NULL
    WHERE account_code IS NOT NULL
      AND TRIM(account_code) = ''
  `);

  const duplicates = await prisma.$queryRawUnsafe(`
    SELECT
      account_code AS accountCode,
      COUNT(*) AS duplicateCount,
      GROUP_CONCAT(id ORDER BY id SEPARATOR ', ') AS recordIds
    FROM finance_accounts
    WHERE account_code IS NOT NULL
      AND TRIM(account_code) <> ''
    GROUP BY account_code
    HAVING COUNT(*) > 1
    ORDER BY account_code
  `);

  if (!Array.isArray(duplicates) || duplicates.length === 0) {
    return;
  }

  const summary = duplicates
    .slice(0, 10)
    .map((item) => `account_code="${item.accountCode}" count=${item.duplicateCount} ids=[${item.recordIds}]`)
    .join("; ");

  throw new Error(
    `Cannot add unique constraint on finance_accounts.account_code because duplicate values already exist. ${summary}`,
  );
}

async function runPrismaDbPush() {
  await normalizeFinanceAccountCodesBeforeDbPush();

  console.log("Running prisma db push...");
  await runNodeScript(
    ["node_modules/prisma/build/index.js", "db", "push", "--skip-generate", "--accept-data-loss"],
    "prisma db push",
  );
}

async function ensureAdminUser() {
  if (!isEnabled(process.env.BOOTSTRAP_ADMIN)) {
    console.log("BOOTSTRAP_ADMIN is disabled, skipping admin upsert.");
    return;
  }

  const email = process.env.ADMIN_EMAIL || "admin@ubonlocal.go.th";
  const name = process.env.ADMIN_NAME || "ADMIN Ubon";
  const passwordHash =
    process.env.ADMIN_PASSWORD_HASH ||
    "$2a$12$lJNvdmuznRxQoljlo7SfTuol.b0HSGZsN8bel2SXpS9ICO7IM.dCS";

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "admin",
      healthUnitId: null,
      isActive: true,
      loginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email,
      passwordHash,
      name,
      role: "admin",
      isActive: true,
    },
    select: { id: true, email: true, role: true, isActive: true },
  });

  console.log("Admin user ensured:", user);
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

async function importKpiSeed() {
  const seedPath = path.join(process.cwd(), "data", "kpi-seed.json");
  if (!fs.existsSync(seedPath)) {
    console.log(`KPI seed not found at ${seedPath}, skipping import.`);
    return;
  }

  const payload = JSON.parse(fs.readFileSync(seedPath, "utf8"));

  for (const category of payload.categories ?? []) {
    await prisma.kpiCategory.upsert({
      where: { code: category.code },
      update: {
        nameTh: category.nameTh,
        nameEn: category.nameEn,
        description: category.description,
        displayOrder: category.displayOrder,
        colorCode: category.colorCode,
        isActive: category.isActive,
      },
      create: {
        code: category.code,
        nameTh: category.nameTh,
        nameEn: category.nameEn,
        description: category.description,
        displayOrder: category.displayOrder,
        colorCode: category.colorCode,
        isActive: category.isActive,
      },
    });
  }

  const categories = await prisma.kpiCategory.findMany({
    select: { id: true, code: true },
  });
  const categoryIdByCode = new Map(categories.map((item) => [item.code, item.id]));

  for (const definition of payload.definitions ?? []) {
    const categoryId = categoryIdByCode.get(definition.categoryCode);
    if (!categoryId) {
      continue;
    }

    await prisma.kpiDefinition.upsert({
      where: { code: definition.code },
      update: {
        categoryId,
        nameTh: definition.nameTh,
        nameEn: definition.nameEn,
        description: definition.description,
        unit: definition.unit,
        targetValue: definition.targetValue,
        targetType: definition.targetType,
        calculationFormula: definition.calculationFormula,
        dataSource: definition.dataSource,
        reportLink: definition.reportLink,
        displayOrder: definition.displayOrder,
        isActive: definition.isActive,
        isDeleted: definition.isDeleted,
      },
      create: {
        categoryId,
        code: definition.code,
        nameTh: definition.nameTh,
        nameEn: definition.nameEn,
        description: definition.description,
        unit: definition.unit,
        targetValue: definition.targetValue,
        targetType: definition.targetType,
        calculationFormula: definition.calculationFormula,
        dataSource: definition.dataSource,
        reportLink: definition.reportLink,
        displayOrder: definition.displayOrder,
        isActive: definition.isActive,
        isDeleted: definition.isDeleted,
      },
    });
  }

  let createdUnits = 0;
  let updatedUnits = 0;

  for (const item of payload.units ?? []) {
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
      status: item.status || "active",
      isDeleted: false,
    };

    const existing = await prisma.healthUnit.findUnique({
      where: { code: item.code },
    });

    if (existing) {
      await prisma.healthUnit.update({
        where: { id: existing.id },
        data,
      });
      updatedUnits += 1;
    } else {
      await prisma.healthUnit.create({
        data: {
          code: item.code,
          ...data,
        },
      });
      createdUnits += 1;
    }
  }

  const definitions = await prisma.kpiDefinition.findMany({
    select: { id: true, code: true },
  });
  const definitionIdByCode = new Map(definitions.map((item) => [item.code, item.id]));

  const units = await prisma.healthUnit.findMany({
    where: { code: { in: (payload.units ?? []).map((item) => item.code) } },
    select: { id: true, code: true },
  });
  const unitIdByCode = new Map(units.map((item) => [item.code, item.id]));

  const fiscalYears = [...new Set((payload.results ?? []).map((item) => item.fiscalYear))];
  for (const fiscalYear of fiscalYears) {
    await ensureFiscalPeriods(fiscalYear);
  }

  let importedResults = 0;

  for (const item of payload.results ?? []) {
    const kpiId = definitionIdByCode.get(item.kpiCode);
    const healthUnitId = unitIdByCode.get(item.unitCode);

    if (!kpiId || !healthUnitId) {
      continue;
    }

    const period = await prisma.fiscalPeriod.findUnique({
      where: {
        fiscalYear_quarter_month: {
          fiscalYear: item.fiscalYear,
          quarter: quarterForMonth(item.month),
          month: item.month,
        },
      },
      select: { id: true },
    });

    if (!period) {
      continue;
    }

    await prisma.kpiResult.upsert({
      where: {
        kpiId_healthUnitId_fiscalPeriodId: {
          kpiId,
          healthUnitId,
          fiscalPeriodId: period.id,
        },
      },
      update: {
        targetValue: item.targetValue,
        actualValue: item.actualValue,
        percentage: item.percentage,
        notes: item.notes,
        evidenceUrl: item.evidenceUrl,
        reviewStatus: item.reviewStatus,
      },
      create: {
        kpiId,
        healthUnitId,
        fiscalPeriodId: period.id,
        targetValue: item.targetValue,
        actualValue: item.actualValue,
        percentage: item.percentage,
        notes: item.notes,
        evidenceUrl: item.evidenceUrl,
        reviewStatus: item.reviewStatus,
      },
    });

    importedResults += 1;
  }

  console.log(
    `KPI seed import complete: ${payload.categories?.length ?? 0} categories, ${payload.definitions?.length ?? 0} definitions, ${createdUnits} units created, ${updatedUnits} units updated, ${importedResults} KPI results imported.`,
  );
}

async function bootstrap() {
  await ensureUtf8mb4Encoding();

  await runPrismaDbPush();
  await ensureAdminUser();

  if (!isEnabled(process.env.BOOTSTRAP_SEED)) {
    console.log("BOOTSTRAP_SEED is disabled, skipping production seed import.");
    return;
  }

  console.log("Importing production seed data...");
  await importTransferSeed();
  await importKpiSeed();
}

async function seedOnly() {
  try {
    await ensureUtf8mb4Encoding();
    console.log("Running prisma db push before manual seed...");
    await runPrismaDbPush();
    await ensureAdminUser();

    console.log("Running manual production seed import...");
    await importTransferSeed();
    await importKpiSeed();
  } catch (error) {
    console.error("Manual seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (process.argv.includes("--seed-only")) {
    await seedOnly();
    return;
  }

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
