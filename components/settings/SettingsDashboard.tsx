"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  CalendarRange,
  MapPinned,
  Pencil,
  Plus,
  RefreshCcw,
  Settings2,
  Trash2,
  Upload,
  UserCog,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FinanceSettingsSection } from "@/components/settings/FinanceSettingsSection";

type UserItem = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "manager" | "staff" | "viewer";
  healthUnitId: number | null;
  isActive: boolean;
  healthUnit?: {
    id: number;
    code?: string;
    name: string;
  } | null;
};

type DashboardStats = {
  totalUnits: number;
  totalPopulation: number;
  totalVillages: number;
  totalHouseholds: number;
  totalVolunteers: number;
};

type HealthUnitItem = {
  id: number;
  code: string;
  name: string;
  shortName: string | null;
  amphoeId: number;
  amphoeName: string;
  tambonId: number | null;
  tambonName: string | null;
  moo: string | null;
  affiliation: string | null;
  email: string | null;
  phone: string | null;
  transferYear: number | null;
  unitSize: string | null;
  cupCode: string | null;
  cupName: string | null;
  localAuthority: string | null;
  province: string | null;
  ucPopulation66: number | null;
  ucPopulation67: number | null;
  ucPopulation68: number | null;
  templeCount: number;
  primarySchoolCount: number;
  opportunitySchoolCount: number;
  secondarySchoolCount: number;
  childDevelopmentCenterCount: number;
  healthStationCount: number;
  status: "active" | "inactive";
};

type HealthUnitDetailItem = HealthUnitItem & {
  demographics: {
    totalPopulation: number | null;
    male: number | null;
    female: number | null;
    elderlyPopulation: number | null;
    villages: number | null;
    households: number | null;
    healthVolunteers: number | null;
  } | null;
};

type DemographicHistoryItem = {
  id: number;
  healthUnitId: number;
  fiscalPeriodId: number;
  male: number | null;
  female: number | null;
  totalPopulation: number | null;
  elderlyPopulation: number | null;
  villages: number | null;
  households: number | null;
  healthVolunteers: number | null;
  recordedAt: string;
  fiscalPeriod: {
    fiscalYear: number;
    quarter: number;
    month: number;
    monthNameTh: string;
  };
};

type FiscalPeriodItem = {
  id?: number;
  fiscalYear: number;
  quarter: number;
  month: number;
  monthNameTh?: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean;
};

type FiscalYearSummary = {
  fiscalYear: number;
  periodCount: number;
  closedCount: number;
  hasUsage: boolean;
  totalKpiResults: number;
  totalFinanceRecords: number;
  totalDemographics: number;
};

type DistrictItem = {
  id: number;
  code: string;
  nameTh: string;
};

type SubdistrictItem = {
  id: number;
  code: string;
  nameTh: string;
  amphoeId: number;
};

type KpiCategoryItem = {
  id: number;
  code: string;
  nameTh: string;
  nameEn?: string | null;
  displayOrder: number;
  isActive?: boolean;
  _count?: {
    definitions: number;
  };
};

type KpiDefinitionAdminItem = {
  id: number;
  categoryId: number;
  code: string;
  nameTh: string;
  nameEn: string | null;
  unit: string;
  targetValue: number | null;
  targetType: "min" | "max" | "exact";
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  category: KpiCategoryItem;
  _count: {
    results: number;
  };
};

type KpiResultItem = {
  id: number;
  kpiId: number;
  kpiCode: string;
  kpiNameTh: string;
  categoryId: number;
  categoryCode: string;
  categoryNameTh: string;
  healthUnitId: number;
  unitCode: string;
  unitName: string;
  fiscalPeriodId: number;
  fiscalYear: number;
  quarter: number;
  month: number;
  monthNameTh: string;
  targetValue: number;
  actualValue: number;
  percentage: number;
  notes: string | null;
  reviewStatus: "draft" | "submitted" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

type UserFormState = {
  email: string;
  password: string;
  name: string;
  role: UserItem["role"];
  healthUnitId: string;
  isActive: boolean;
};

type UnitFormState = {
  code: string;
  name: string;
  shortName: string;
  amphoeId: string;
  tambonId: string;
  moo: string;
  affiliation: string;
  email: string;
  phone: string;
  transferYear: string;
  unitSize: string;
  cupCode: string;
  cupName: string;
  localAuthority: string;
  province: string;
  ucPopulation66: string;
  ucPopulation67: string;
  ucPopulation68: string;
  male: string;
  female: string;
  elderlyPopulation: string;
  totalPopulation: string;
  villages: string;
  households: string;
  healthVolunteers: string;
  templeCount: string;
  primarySchoolCount: string;
  opportunitySchoolCount: string;
  secondarySchoolCount: string;
  childDevelopmentCenterCount: string;
  healthStationCount: string;
  status: "active" | "inactive";
};

type FiscalYearFormState = {
  fiscalYear: string;
};

type KpiDefinitionFormState = {
  categoryId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  unit: string;
  targetValue: string;
  targetType: "min" | "max" | "exact";
  displayOrder: string;
  isActive: boolean;
};

type KpiCategoryFormState = {
  code: string;
  nameTh: string;
  nameEn: string;
  displayOrder: string;
  isActive: boolean;
};

type KpiResultFormState = {
  healthUnitId: string;
  kpiId: string;
  fiscalPeriodId: string;
  targetValue: string;
  actualValue: string;
  notes: string;
};

const emptyUserForm: UserFormState = {
  email: "",
  password: "",
  name: "",
  role: "viewer",
  healthUnitId: "",
  isActive: true,
};

const emptyUnitForm: UnitFormState = {
  code: "",
  name: "",
  shortName: "",
  amphoeId: "",
  tambonId: "",
  moo: "",
  affiliation: "",
  email: "",
  phone: "",
  transferYear: "",
  unitSize: "",
  cupCode: "",
  cupName: "",
  localAuthority: "",
  province: "",
  ucPopulation66: "0",
  ucPopulation67: "0",
  ucPopulation68: "0",
  male: "0",
  female: "0",
  elderlyPopulation: "0",
  totalPopulation: "0",
  villages: "0",
  households: "0",
  healthVolunteers: "0",
  templeCount: "0",
  primarySchoolCount: "0",
  opportunitySchoolCount: "0",
  secondarySchoolCount: "0",
  childDevelopmentCenterCount: "0",
  healthStationCount: "0",
  status: "active",
};

const emptyFiscalYearForm: FiscalYearFormState = {
  fiscalYear: "",
};

const emptyKpiForm: KpiDefinitionFormState = {
  categoryId: "",
  code: "",
  nameTh: "",
  nameEn: "",
  unit: "%",
  targetValue: "",
  targetType: "min",
  displayOrder: "0",
  isActive: true,
};

const emptyKpiCategoryForm: KpiCategoryFormState = {
  code: "",
  nameTh: "",
  nameEn: "",
  displayOrder: "0",
  isActive: true,
};

const emptyKpiResultForm: KpiResultFormState = {
  healthUnitId: "",
  kpiId: "",
  fiscalPeriodId: "",
  targetValue: "",
  actualValue: "",
  notes: "",
};

const dialogContentClassName = "flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg";
const dialogContentWideClassName = "flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl";
const dialogFormClassName = "flex min-h-0 flex-1 flex-col";
const dialogBodyClassName = "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1";
const dialogFooterClassName = "border-t bg-background pt-4";

const roleLabels: Record<UserItem["role"], string> = {
  admin: "ผู้ดูแลระบบ",
  manager: "ผู้จัดการ",
  staff: "เจ้าหน้าที่",
  viewer: "ผู้ดูข้อมูล",
};

const roleDescriptions: Record<UserItem["role"], string> = {
  admin: "ดูและจัดการข้อมูลได้ทุกหน่วยบริการ รวมถึงผู้ใช้ ข้อมูลระบบ KPI การเงิน และการตั้งค่าหลัก",
  manager: "เข้าถึงข้อมูลหน่วยบริการในอำเภอเดียวกับหน่วยบริการที่ผูกกับบัญชี เหมาะสำหรับผู้ดูแลระดับอำเภอ",
  staff: "บันทึกและติดตามข้อมูลของหน่วยบริการที่ตนเองสังกัด เห็นข้อมูลได้เฉพาะหน่วยของตน",
  viewer: "ดูข้อมูลของหน่วยบริการที่ตนเองสังกัดได้อย่างเดียว ไม่เหมาะกับงานแก้ไขหรือบันทึกข้อมูล",
};

function formatNumber(value?: number) {
  return new Intl.NumberFormat("th-TH").format(value || 0);
}

function getKpiCategoryLabel(category: KpiCategoryItem) {
  if (category.code === "PPFS") {
    return "PPFS";
  }
  if (category.code === "TTM") {
    return "แพทย์แผนไทย";
  }
  return category.nameTh;
}

function getRoleBadgeClass(role: UserItem["role"]) {
  switch (role) {
    case "admin":
      return "bg-primary text-primary-foreground";
    case "manager":
      return "bg-accent text-accent-foreground";
    case "staff":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusBadgeClass(status: "active" | "inactive") {
  return status === "active" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600";
}

function getReviewStatusBadgeClass(status: KpiResultItem["reviewStatus"]) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "submitted":
      return "bg-amber-100 text-amber-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-200 text-slate-600";
  }
}

function getReviewStatusLabel(status: KpiResultItem["reviewStatus"]) {
  switch (status) {
    case "approved":
      return "อนุมัติ";
    case "submitted":
      return "ส่งตรวจ";
    case "rejected":
      return "ตีกลับ";
    default:
      return "ฉบับร่าง";
  }
}

function parseNumberInput(value: string) {
  return Number(value || "0");
}

function isZeroDemographicForm(form: Pick<UnitFormState, "male" | "female" | "elderlyPopulation" | "totalPopulation" | "villages" | "households" | "healthVolunteers">) {
  return (
    parseNumberInput(form.male) === 0 &&
    parseNumberInput(form.female) === 0 &&
    parseNumberInput(form.elderlyPopulation) === 0 &&
    parseNumberInput(form.totalPopulation) === 0 &&
    parseNumberInput(form.villages) === 0 &&
    parseNumberInput(form.households) === 0 &&
    parseNumberInput(form.healthVolunteers) === 0
  );
}

function RoleDescriptionList({ selectedRole }: { selectedRole?: UserItem["role"] }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-sm font-medium">คำอธิบายสิทธิ์การใช้งาน</p>
      <div className="mt-3 space-y-3 text-sm">
        {(Object.keys(roleLabels) as UserItem["role"][]).map((role) => (
          <div
            key={role}
            className={`rounded-lg border px-3 py-2 ${
              selectedRole === role ? "border-primary bg-primary/5" : "border-border bg-background/70"
            }`}
          >
            <p className="font-medium text-foreground">{roleLabels[role]}</p>
            <p className="text-muted-foreground">{roleDescriptions[role]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsDashboard() {
  const { data: session, status } = useSession();
  const currentUser = session?.user as
    | { name?: string | null; role?: UserItem["role"] }
    | undefined;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [units, setUnits] = useState<HealthUnitItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [createSubdistricts, setCreateSubdistricts] = useState<SubdistrictItem[]>([]);
  const [editSubdistricts, setEditSubdistricts] = useState<SubdistrictItem[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYearSummary[]>([]);
  const [fiscalPeriods, setFiscalPeriods] = useState<FiscalPeriodItem[]>([]);
  const [kpiDefinitions, setKpiDefinitions] = useState<KpiDefinitionAdminItem[]>([]);
  const [kpiCategories, setKpiCategories] = useState<KpiCategoryItem[]>([]);
  const [kpiResults, setKpiResults] = useState<KpiResultItem[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<FiscalPeriodItem | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportingUsers, setIsImportingUsers] = useState(false);
  const [isKpiResultsLoading, setIsKpiResultsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState<UserFormState>(emptyUserForm);
  const [editForm, setEditForm] = useState<UserFormState>(emptyUserForm);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [search, setSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [unitTransferYearFilter, setUnitTransferYearFilter] = useState("");
  const [unitSizeFilter, setUnitSizeFilter] = useState("all");
  const [fiscalYearForm, setFiscalYearForm] = useState<FiscalYearFormState>(emptyFiscalYearForm);
  const [editingPeriod, setEditingPeriod] = useState<FiscalPeriodItem | null>(null);
  const [kpiSearch, setKpiSearch] = useState("");
  const [createKpiForm, setCreateKpiForm] = useState<KpiDefinitionFormState>(emptyKpiForm);
  const [createKpiCategoryForm, setCreateKpiCategoryForm] = useState<KpiCategoryFormState>(emptyKpiCategoryForm);
  const [editingKpi, setEditingKpi] = useState<KpiDefinitionAdminItem | null>(null);
  const [editKpiForm, setEditKpiForm] = useState<KpiDefinitionFormState>(emptyKpiForm);
  const [editingKpiCategory, setEditingKpiCategory] = useState<KpiCategoryItem | null>(null);
  const [editKpiCategoryForm, setEditKpiCategoryForm] = useState<KpiCategoryFormState>(emptyKpiCategoryForm);
  const [kpiResultSearch, setKpiResultSearch] = useState("");
  const [kpiResultYearFilter, setKpiResultYearFilter] = useState("");
  const [kpiResultUnitFilter, setKpiResultUnitFilter] = useState("");
  const [kpiResultCategoryFilter, setKpiResultCategoryFilter] = useState("");
  const [createKpiResultForm, setCreateKpiResultForm] = useState<KpiResultFormState>(emptyKpiResultForm);
  const [editingKpiResult, setEditingKpiResult] = useState<KpiResultItem | null>(null);
  const [editKpiResultForm, setEditKpiResultForm] = useState<KpiResultFormState>(emptyKpiResultForm);
  const [createUnitForm, setCreateUnitForm] = useState<UnitFormState>(emptyUnitForm);
  const [editingUnit, setEditingUnit] = useState<HealthUnitItem | null>(null);
  const [editUnitForm, setEditUnitForm] = useState<UnitFormState>(emptyUnitForm);
  const [unitDemographicHistory, setUnitDemographicHistory] = useState<DemographicHistoryItem[]>([]);

  async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error || "โหลดข้อมูลไม่สำเร็จ");
    }
    return response.json() as Promise<T>;
  }

  async function loadSubdistricts(amphoeId: string, mode: "create" | "edit") {
    if (!amphoeId) {
      if (mode === "create") {
        setCreateSubdistricts([]);
      } else {
        setEditSubdistricts([]);
      }
      return;
    }

    try {
      const data = await fetchJson<SubdistrictItem[]>(`/api/health-units?subdistricts=true&amphoeId=${amphoeId}`);
      if (mode === "create") {
        setCreateSubdistricts(data);
      } else {
        setEditSubdistricts(data);
      }
    } catch {
      if (mode === "create") {
        setCreateSubdistricts([]);
      } else {
        setEditSubdistricts([]);
      }
    }
  }

  async function loadKpiResults(filters?: {
    fiscalYear?: string;
    healthUnitId?: string;
    categoryId?: string;
  }) {
    try {
      setIsKpiResultsLoading(true);

      const params = new URLSearchParams({
        pageSize: "500",
        sortBy: "updatedAt",
        sortOrder: "desc",
      });

      const fiscalYear = filters?.fiscalYear ?? kpiResultYearFilter;
      const healthUnitId = filters?.healthUnitId ?? kpiResultUnitFilter;
      const categoryId = filters?.categoryId ?? kpiResultCategoryFilter;

      if (fiscalYear) {
        params.set("fiscalYear", fiscalYear);
      }
      if (healthUnitId) {
        params.set("healthUnitId", healthUnitId);
      }
      if (categoryId) {
        params.set("categoryId", categoryId);
      }

      const data = await fetchJson<{ results: KpiResultItem[]; total: number }>(`/api/kpi/results?${params.toString()}`);
      setKpiResults(data.results);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล KPI รายหน่วยบริการ");
      setKpiResults([]);
    } finally {
      setIsKpiResultsLoading(false);
    }
  }

  async function loadData() {
    try {
      setIsLoading(true);
      setError("");

      const [usersData, statsData, unitsData, yearsData, currentPeriodData, districtsData, fiscalYearsData, fiscalPeriodsData, kpiData, kpiCategoriesData] = await Promise.all([
        fetchJson<UserItem[]>("/api/auth/users"),
        fetchJson<DashboardStats>("/api/health-units?stats=true"),
        fetchJson<HealthUnitItem[]>("/api/health-units"),
        fetchJson<number[]>("/api/fiscal-periods?years=true"),
        fetchJson<FiscalPeriodItem>("/api/fiscal-periods?current=true"),
        fetchJson<DistrictItem[]>("/api/health-units?districts=true"),
        fetchJson<FiscalYearSummary[]>("/api/fiscal-periods?summary=true"),
        fetchJson<FiscalPeriodItem[]>("/api/fiscal-periods"),
        fetchJson<{ definitions: KpiDefinitionAdminItem[]; categories: KpiCategoryItem[] }>("/api/kpi-definitions?admin=true"),
        fetchJson<KpiCategoryItem[]>("/api/kpi-categories"),
      ]);

      setUsers(usersData);
      setStats(statsData);
      setUnits(unitsData);
      setYears(yearsData);
      setCurrentPeriod(currentPeriodData);
      setDistricts(districtsData);
      setFiscalYears(fiscalYearsData);
      setFiscalPeriods(fiscalPeriodsData);
      setKpiDefinitions(kpiData.definitions);
      setKpiCategories(kpiCategoriesData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (currentPeriod && !createKpiResultForm.fiscalPeriodId) {
      setCreateKpiResultForm((current) => ({ ...current, fiscalPeriodId: String(currentPeriod.id ?? "") }));
    }
    if (currentPeriod && !kpiResultYearFilter) {
      setKpiResultYearFilter(String(currentPeriod.fiscalYear));
    }
  }, [currentPeriod, createKpiResultForm.fiscalPeriodId, kpiResultYearFilter]);

  useEffect(() => {
    void loadSubdistricts(createUnitForm.amphoeId, "create");
  }, [createUnitForm.amphoeId]);

  useEffect(() => {
    void loadSubdistricts(editUnitForm.amphoeId, "edit");
  }, [editUnitForm.amphoeId]);

  useEffect(() => {
    if (!currentPeriod && !kpiResultYearFilter) {
      return;
    }
    void loadKpiResults();
  }, [currentPeriod, kpiResultYearFilter, kpiResultUnitFilter, kpiResultCategoryFilter]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      const unitName = user.healthUnit?.name?.toLowerCase() || "";
      return (
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        unitName.includes(keyword)
      );
    });
  }, [search, users]);

  const filteredUnits = useMemo(() => {
    const keyword = unitSearch.trim().toLowerCase();
    return units.filter((unit) => {
      const matchesKeyword =
        !keyword ||
        unit.code.toLowerCase().includes(keyword) ||
        unit.name.toLowerCase().includes(keyword) ||
        unit.amphoeName.toLowerCase().includes(keyword) ||
        (unit.tambonName || "").toLowerCase().includes(keyword);
      const matchesTransferYear =
        !unitTransferYearFilter ||
        String(unit.transferYear || "").includes(unitTransferYearFilter.trim());
      const matchesSize = unitSizeFilter === "all" || unit.unitSize === unitSizeFilter;

      return matchesKeyword && matchesTransferYear && matchesSize;
    });
  }, [unitSearch, unitTransferYearFilter, unitSizeFilter, units]);

  const filteredKpis = useMemo(() => {
    const keyword = kpiSearch.trim().toLowerCase();
    if (!keyword) {
      return kpiDefinitions;
    }

    return kpiDefinitions.filter((item) => {
      return (
        item.code.toLowerCase().includes(keyword) ||
        item.nameTh.toLowerCase().includes(keyword) ||
        item.category.nameTh.toLowerCase().includes(keyword)
      );
    });
  }, [kpiDefinitions, kpiSearch]);

  const filteredKpiResults = useMemo(() => {
    const keyword = kpiResultSearch.trim().toLowerCase();
    if (!keyword) {
      return kpiResults;
    }

    return kpiResults.filter((item) => {
      return (
        item.kpiCode.toLowerCase().includes(keyword) ||
        item.kpiNameTh.toLowerCase().includes(keyword) ||
        item.unitCode.toLowerCase().includes(keyword) ||
        item.unitName.toLowerCase().includes(keyword) ||
        item.categoryNameTh.toLowerCase().includes(keyword)
      );
    });
  }, [kpiResultSearch, kpiResults]);

  function resetFeedback() {
    setMessage("");
    setError("");
  }

  function fillKpiResultTargetValue(
    formSetter: React.Dispatch<React.SetStateAction<KpiResultFormState>>,
    kpiId: string
  ) {
    const definition = kpiDefinitions.find((item) => String(item.id) === kpiId);
    formSetter((current) => ({
      ...current,
      kpiId,
      targetValue:
        definition?.targetValue !== null && definition?.targetValue !== undefined
          ? String(definition.targetValue)
          : current.targetValue,
    }));
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          name: createForm.name,
          role: createForm.role,
          healthUnitId: createForm.healthUnitId ? Number(createForm.healthUnitId) : undefined,
        }),
      });

      const body = (await response.json()) as { error?: string; message?: string; data?: { id: number } };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถสร้างผู้ใช้ได้");
      }

      setMessage(body.message || "สร้างผู้ใช้เรียบร้อยแล้ว");
      setCreateForm(emptyUserForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditDialog(user: UserItem) {
    resetFeedback();
    setEditingUser(user);
    setEditForm({
      email: user.email,
      password: "",
      name: user.name,
      role: user.role,
      healthUnitId: user.healthUnitId ? String(user.healthUnitId) : "",
      isActive: user.isActive,
    });
  }

  async function handleUpdateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch("/api/auth/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          name: editForm.name,
          role: editForm.role,
          healthUnitId: editForm.healthUnitId ? Number(editForm.healthUnitId) : null,
          isActive: editForm.isActive,
        }),
      });

      const body = (await response.json()) as { error?: string; message?: string; data?: { id: number } };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้");
      }

      setMessage(body.message || "อัปเดตผู้ใช้เรียบร้อยแล้ว");
      setEditingUser(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteUser(user: UserItem) {
    const confirmed = window.confirm(`ยืนยันการลบผู้ใช้ ${user.name} ?`);
    if (!confirmed) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/auth/users?id=${user.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string; data?: { id: number } };

      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถลบผู้ใช้ได้");
      }

      setMessage(body.message || "ลบผู้ใช้เรียบร้อยแล้ว");
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถลบผู้ใช้ได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImportUsers() {
    const confirmed = window.confirm("นำเข้าผู้ใช้เจ้าหน้าที่จากไฟล์ CSV และตั้งรหัสผ่านเป็น 12345678! ?");
    if (!confirmed) {
      return;
    }

    resetFeedback();
    setIsImportingUsers(true);

    try {
      const response = await fetch("/api/auth/users/import", { method: "POST" });
      const body = (await response.json()) as {
        error?: string;
        csvRows?: number;
        createdUsers?: number;
        updatedUsers?: number;
        skippedRowsCount?: number;
      };

      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถนำเข้าผู้ใช้ได้");
      }

      setMessage(
        `นำเข้าผู้ใช้เรียบร้อย: ทั้งหมด ${body.csvRows ?? 0} รายการ, สร้างใหม่ ${body.createdUsers ?? 0}, อัปเดต ${body.updatedUsers ?? 0}, ข้าม ${body.skippedRowsCount ?? 0}`
      );
      await loadData();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "ไม่สามารถนำเข้าผู้ใช้ได้");
    } finally {
      setIsImportingUsers(false);
    }
  }

  async function openEditUnitDialog(unit: HealthUnitItem) {
    resetFeedback();
    const baseForm: UnitFormState = {
      code: unit.code,
      name: unit.name,
      shortName: unit.shortName || "",
      amphoeId: String(unit.amphoeId),
      tambonId: unit.tambonId ? String(unit.tambonId) : "",
      moo: unit.moo || "",
      affiliation: unit.affiliation || "",
      email: unit.email || "",
      phone: unit.phone || "",
      transferYear: unit.transferYear ? String(unit.transferYear) : "",
      unitSize: unit.unitSize || "",
      cupCode: unit.cupCode || "",
      cupName: unit.cupName || "",
      localAuthority: unit.localAuthority || "",
      province: unit.province || "",
      ucPopulation66: String(unit.ucPopulation66 ?? 0),
      ucPopulation67: String(unit.ucPopulation67 ?? 0),
      ucPopulation68: String(unit.ucPopulation68 ?? 0),
      male: "0",
      female: "0",
      elderlyPopulation: "0",
      totalPopulation: "0",
      villages: "0",
      households: "0",
      healthVolunteers: "0",
      templeCount: String(unit.templeCount ?? 0),
      primarySchoolCount: String(unit.primarySchoolCount ?? 0),
      opportunitySchoolCount: String(unit.opportunitySchoolCount ?? 0),
      secondarySchoolCount: String(unit.secondarySchoolCount ?? 0),
      childDevelopmentCenterCount: String(unit.childDevelopmentCenterCount ?? 0),
      healthStationCount: String(unit.healthStationCount ?? 0),
      status: unit.status,
    };

    setEditingUnit(unit);
    setEditUnitForm(baseForm);
    setUnitDemographicHistory([]);

    if (!currentPeriod?.id) {
      try {
        const history = await fetchJson<DemographicHistoryItem[]>(`/api/health-units/${unit.id}?demographicsHistory=true`);
        setUnitDemographicHistory(history);
      } catch {
        setUnitDemographicHistory([]);
      }
      return;
    }

    try {
      const [detail, history] = await Promise.all([
        fetchJson<HealthUnitDetailItem>(`/api/health-units/${unit.id}?demographics=true&fiscalPeriodId=${currentPeriod.id}`),
        fetchJson<DemographicHistoryItem[]>(`/api/health-units/${unit.id}?demographicsHistory=true`),
      ]);
      setEditUnitForm({
        ...baseForm,
        male: String(detail.demographics?.male ?? 0),
        female: String(detail.demographics?.female ?? 0),
        elderlyPopulation: String(detail.demographics?.elderlyPopulation ?? 0),
        totalPopulation: String(detail.demographics?.totalPopulation ?? 0),
        villages: String(detail.demographics?.villages ?? 0),
        households: String(detail.demographics?.households ?? 0),
        healthVolunteers: String(detail.demographics?.healthVolunteers ?? 0),
      });
      setUnitDemographicHistory(history);
    } catch {
      setEditUnitForm(baseForm);
      setUnitDemographicHistory([]);
    }
  }

  async function handleCreateUnit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch("/api/health-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: createUnitForm.code,
          name: createUnitForm.name,
          shortName: createUnitForm.shortName || undefined,
          amphoeId: Number(createUnitForm.amphoeId),
          tambonId: createUnitForm.tambonId ? Number(createUnitForm.tambonId) : undefined,
          moo: createUnitForm.moo || undefined,
          affiliation: createUnitForm.affiliation || undefined,
          email: createUnitForm.email || "",
          phone: createUnitForm.phone || undefined,
          transferYear: createUnitForm.transferYear ? Number(createUnitForm.transferYear) : undefined,
          unitSize: createUnitForm.unitSize || undefined,
          cupCode: createUnitForm.cupCode || undefined,
          cupName: createUnitForm.cupName || undefined,
          localAuthority: createUnitForm.localAuthority || undefined,
          province: createUnitForm.province || undefined,
          ucPopulation66: Number(createUnitForm.ucPopulation66 || "0"),
          ucPopulation67: Number(createUnitForm.ucPopulation67 || "0"),
          ucPopulation68: Number(createUnitForm.ucPopulation68 || "0"),
          templeCount: Number(createUnitForm.templeCount || "0"),
          primarySchoolCount: Number(createUnitForm.primarySchoolCount || "0"),
          opportunitySchoolCount: Number(createUnitForm.opportunitySchoolCount || "0"),
          secondarySchoolCount: Number(createUnitForm.secondarySchoolCount || "0"),
          childDevelopmentCenterCount: Number(createUnitForm.childDevelopmentCenterCount || "0"),
          healthStationCount: Number(createUnitForm.healthStationCount || "0"),
        }),
      });

      const body = (await response.json()) as { error?: string; message?: string; data?: { id: number } };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถเพิ่มหน่วยบริการได้");
      }

      setMessage(body.message || "เพิ่มหน่วยบริการเรียบร้อยแล้ว");
      if (currentPeriod?.id && body.data?.id && !isZeroDemographicForm(createUnitForm)) {
        const demographicsResponse = await fetch(`/api/health-units/${body.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fiscalPeriodId: currentPeriod.id,
            male: parseNumberInput(createUnitForm.male),
            female: parseNumberInput(createUnitForm.female),
            elderlyPopulation: parseNumberInput(createUnitForm.elderlyPopulation),
            totalPopulation: parseNumberInput(createUnitForm.totalPopulation),
            villages: parseNumberInput(createUnitForm.villages),
            households: parseNumberInput(createUnitForm.households),
            healthVolunteers: parseNumberInput(createUnitForm.healthVolunteers),
          }),
        });

        const demographicsBody = (await demographicsResponse.json()) as { error?: string };
        if (!demographicsResponse.ok) {
          throw new Error(demographicsBody.error || "ไม่สามารถบันทึกข้อมูลประชากรเริ่มต้นได้");
        }
      }

      setCreateUnitForm(emptyUnitForm);
      setCreateSubdistricts([]);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่มหน่วยบริการได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateUnit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUnit) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/health-units/${editingUnit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editUnitForm.code,
          name: editUnitForm.name,
          shortName: editUnitForm.shortName || undefined,
          amphoeId: editUnitForm.amphoeId ? Number(editUnitForm.amphoeId) : undefined,
          tambonId: editUnitForm.tambonId ? Number(editUnitForm.tambonId) : null,
          moo: editUnitForm.moo || undefined,
          affiliation: editUnitForm.affiliation || undefined,
          email: editUnitForm.email || "",
          phone: editUnitForm.phone || undefined,
          transferYear: editUnitForm.transferYear ? Number(editUnitForm.transferYear) : undefined,
          unitSize: editUnitForm.unitSize || undefined,
          cupCode: editUnitForm.cupCode || undefined,
          cupName: editUnitForm.cupName || undefined,
          localAuthority: editUnitForm.localAuthority || undefined,
          province: editUnitForm.province || undefined,
          ucPopulation66: Number(editUnitForm.ucPopulation66 || "0"),
          ucPopulation67: Number(editUnitForm.ucPopulation67 || "0"),
          ucPopulation68: Number(editUnitForm.ucPopulation68 || "0"),
          templeCount: Number(editUnitForm.templeCount || "0"),
          primarySchoolCount: Number(editUnitForm.primarySchoolCount || "0"),
          opportunitySchoolCount: Number(editUnitForm.opportunitySchoolCount || "0"),
          secondarySchoolCount: Number(editUnitForm.secondarySchoolCount || "0"),
          childDevelopmentCenterCount: Number(editUnitForm.childDevelopmentCenterCount || "0"),
          healthStationCount: Number(editUnitForm.healthStationCount || "0"),
          status: editUnitForm.status,
        }),
      });

      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถเพิ่มหน่วยบริการได้");
      }

      if (currentPeriod?.id) {
        const currentPeriodHistory = unitDemographicHistory.find((item) => item.fiscalPeriodId === currentPeriod.id);

        if (isZeroDemographicForm(editUnitForm)) {
          if (currentPeriodHistory) {
            const deleteResponse = await fetch(`/api/health-units/${editingUnit.id}?demographicsId=${currentPeriodHistory.id}`, {
              method: "DELETE",
            });

            const deleteBody = (await deleteResponse.json()) as { error?: string };
            if (!deleteResponse.ok) {
              throw new Error(deleteBody.error || "ไม่สามารถลบข้อมูลประชากรงวดปัจจุบันได้");
            }
          }
        } else {
          const demographicsResponse = await fetch(`/api/health-units/${editingUnit.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fiscalPeriodId: currentPeriod.id,
              male: parseNumberInput(editUnitForm.male),
              female: parseNumberInput(editUnitForm.female),
              elderlyPopulation: parseNumberInput(editUnitForm.elderlyPopulation),
              totalPopulation: parseNumberInput(editUnitForm.totalPopulation),
              villages: parseNumberInput(editUnitForm.villages),
              households: parseNumberInput(editUnitForm.households),
              healthVolunteers: parseNumberInput(editUnitForm.healthVolunteers),
            }),
          });

          const demographicsBody = (await demographicsResponse.json()) as { error?: string };
          if (!demographicsResponse.ok) {
            throw new Error(demographicsBody.error || "ไม่สามารถบันทึกข้อมูลประชากรเริ่มต้นได้");
          }
        }
      }

      setMessage(body.message || "เพิ่มหน่วยบริการเรียบร้อยแล้ว");
      setEditingUnit(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่มหน่วยบริการได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteUnit(unit: HealthUnitItem) {
    const confirmed = window.confirm(`ยืนยันการลบหน่วยบริการ ${unit.name} ?`);
    if (!confirmed) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/health-units/${unit.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถลบหน่วยบริการได้");
      }

      setMessage(body.message || "ลบหน่วยบริการเรียบร้อยแล้ว");
      if (editingUnit?.id === unit.id) {
        setEditingUnit(null);
      }
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถลบหน่วยบริการได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteDemographicHistory(item: DemographicHistoryItem) {
    if (!editingUnit) {
      return;
    }

    const confirmed = window.confirm(
      `ยืนยันการลบข้อมูลประชากร ปี ${item.fiscalPeriod.fiscalYear} ไตรมาส ${item.fiscalPeriod.quarter} เดือน ${item.fiscalPeriod.month} ?`
    );
    if (!confirmed) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/health-units/${editingUnit.id}?demographicsId=${item.id}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถลบข้อมูลประชากรได้");
      }

      setMessage(body.message || "ลบข้อมูลประชากรเรียบร้อยแล้ว");
      await openEditUnitDialog(editingUnit);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถลบข้อมูลประชากรได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateFiscalYear(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch("/api/fiscal-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fiscalYear: Number(fiscalYearForm.fiscalYear) }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถแก้ไขหน่วยบริการได้");
      }
      setMessage(body.message || "แก้ไขหน่วยบริการเรียบร้อยแล้ว");
      setFiscalYearForm(emptyFiscalYearForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถแก้ไขหน่วยบริการได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteFiscalYear(fiscalYear: number) {
    if (!window.confirm(`ยืนยันการลบปีงบประมาณ ${fiscalYear} ?`)) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/fiscal-periods?fiscalYear=${fiscalYear}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถบันทึกข้อมูลประชากรได้");
      }
      setMessage(body.message || "อัปเดตหน่วยบริการเรียบร้อยแล้ว");
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถบันทึกข้อมูลประชากรได้");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditPeriodDialog(period: FiscalPeriodItem) {
    resetFeedback();
    setEditingPeriod(period);
  }

  async function handleUpdatePeriod(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPeriod?.id) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/fiscal-periods/${editingPeriod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthNameTh: editingPeriod.monthNameTh,
          startDate: editingPeriod.startDate,
          endDate: editingPeriod.endDate,
          isClosed: editingPeriod.isClosed,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถเพิ่มปีงบประมาณได้");
      }
      setMessage(body.message || "เพิ่มปีงบประมาณเรียบร้อยแล้ว");
      setEditingPeriod(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่มปีงบประมาณได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateKpiDefinition(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch("/api/kpi-definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: Number(createKpiForm.categoryId),
          code: createKpiForm.code,
          nameTh: createKpiForm.nameTh,
          nameEn: createKpiForm.nameEn,
          unit: createKpiForm.unit,
          targetValue: createKpiForm.targetValue === "" ? undefined : Number(createKpiForm.targetValue),
          targetType: createKpiForm.targetType,
          displayOrder: Number(createKpiForm.displayOrder || "0"),
          isActive: createKpiForm.isActive,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถเพิ่มปีงบประมาณได้");
      }
      setMessage(body.message || "เพิ่มปีงบประมาณเรียบร้อยแล้ว");
      setCreateKpiForm(emptyKpiForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่มปีงบประมาณได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateKpiCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch("/api/kpi-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: createKpiCategoryForm.code,
          nameTh: createKpiCategoryForm.nameTh,
          nameEn: createKpiCategoryForm.nameEn,
          displayOrder: Number(createKpiCategoryForm.displayOrder || "0"),
          isActive: createKpiCategoryForm.isActive,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถแก้ไขงวดปีงบประมาณได้");
      }
      setMessage(body.message || "บันทึกงวดปีงบประมาณเรียบร้อยแล้ว");
      setCreateKpiCategoryForm(emptyKpiCategoryForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถแก้ไขงวดปีงบประมาณได้");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditKpiCategoryDialog(item: KpiCategoryItem) {
    resetFeedback();
    setEditingKpiCategory(item);
    setEditKpiCategoryForm({
      code: item.code,
      nameTh: item.nameTh,
      nameEn: item.nameEn || "",
      displayOrder: String(item.displayOrder),
      isActive: item.isActive ?? true,
    });
  }

  async function handleUpdateKpiCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingKpiCategory) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/kpi-categories/${editingKpiCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editKpiCategoryForm.code,
          nameTh: editKpiCategoryForm.nameTh,
          nameEn: editKpiCategoryForm.nameEn,
          displayOrder: Number(editKpiCategoryForm.displayOrder || "0"),
          isActive: editKpiCategoryForm.isActive,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถเพิ่มหมวดหมู่ KPI ได้");
      }
      setMessage(body.message || "เพิ่มหมวดหมู่ KPI เรียบร้อยแล้ว");
      setEditingKpiCategory(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่มหมวดหมู่ KPI ได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteKpiCategory(item: KpiCategoryItem) {
    if (!window.confirm(`ยืนยันการลบหมวดหมู่ KPI ${getKpiCategoryLabel(item)} ?`)) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/kpi-categories/${item.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถลบหมวดหมู่ KPI ได้");
      }
      setMessage(body.message || "ลบหมวดหมู่ KPI เรียบร้อยแล้ว");
      if (editingKpiCategory?.id === item.id) {
        setEditingKpiCategory(null);
      }
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถลบหมวดหมู่ KPI ได้");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditKpiDialog(item: KpiDefinitionAdminItem) {
    resetFeedback();
    setEditingKpi(item);
    setEditKpiForm({
      categoryId: String(item.categoryId),
      code: item.code,
      nameTh: item.nameTh,
      nameEn: item.nameEn || "",
      unit: item.unit,
      targetValue: item.targetValue === null ? "" : String(item.targetValue),
      targetType: item.targetType,
      displayOrder: String(item.displayOrder),
      isActive: item.isActive,
    });
  }

  async function handleUpdateKpiDefinition(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingKpi) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/kpi-definitions/${editingKpi.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: Number(editKpiForm.categoryId),
          code: editKpiForm.code,
          nameTh: editKpiForm.nameTh,
          nameEn: editKpiForm.nameEn,
          unit: editKpiForm.unit,
          targetValue: editKpiForm.targetValue === "" ? undefined : Number(editKpiForm.targetValue),
          targetType: editKpiForm.targetType,
          displayOrder: Number(editKpiForm.displayOrder || "0"),
          isActive: editKpiForm.isActive,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถเพิ่ม KPI master ได้");
      }
      setMessage(body.message || "เพิ่ม KPI master เรียบร้อยแล้ว");
      setEditingKpi(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่ม KPI master ได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteKpiDefinition(item: KpiDefinitionAdminItem) {
    if (!window.confirm(`ยืนยันการลบ KPI ${item.code} ?`)) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/kpi-definitions/${item.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถลบ KPI master ได้");
      }
      setMessage(body.message || "ลบ KPI master เรียบร้อยแล้ว");
      if (editingKpi?.id === item.id) {
        setEditingKpi(null);
      }
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถลบ KPI master ได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateKpiResult(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch("/api/kpi/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healthUnitId: Number(createKpiResultForm.healthUnitId),
          kpiId: Number(createKpiResultForm.kpiId),
          fiscalPeriodId: Number(createKpiResultForm.fiscalPeriodId),
          targetValue: Number(createKpiResultForm.targetValue),
          actualValue: Number(createKpiResultForm.actualValue),
          notes: createKpiResultForm.notes || undefined,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถบันทึก KPI รายหน่วยบริการได้");
      }

      setMessage(body.message || "เพิ่ม KPI รายหน่วยบริการเรียบร้อยแล้ว");
      setCreateKpiResultForm({
        ...emptyKpiResultForm,
        fiscalPeriodId: createKpiResultForm.fiscalPeriodId || String(currentPeriod?.id ?? ""),
      });
      await Promise.all([loadData(), loadKpiResults()]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถบันทึก KPI รายหน่วยบริการได้");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditKpiResultDialog(item: KpiResultItem) {
    resetFeedback();
    setEditingKpiResult(item);
    setEditKpiResultForm({
      healthUnitId: String(item.healthUnitId),
      kpiId: String(item.kpiId),
      fiscalPeriodId: String(item.fiscalPeriodId),
      targetValue: String(item.targetValue),
      actualValue: String(item.actualValue),
      notes: item.notes || "",
    });
  }

  async function handleUpdateKpiResult(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingKpiResult) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/kpi/results/${editingKpiResult.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetValue: Number(editKpiResultForm.targetValue),
          actualValue: Number(editKpiResultForm.actualValue),
          notes: editKpiResultForm.notes || undefined,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถแก้ไข KPI รายหน่วยบริการได้");
      }

      setMessage(body.message || "แก้ไข KPI รายหน่วยบริการเรียบร้อยแล้ว");
      setEditingKpiResult(null);
      await Promise.all([loadData(), loadKpiResults()]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถแก้ไข KPI รายหน่วยบริการได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteKpiResult(item: KpiResultItem) {
    if (!window.confirm(`ยืนยันการลบ KPI ${item.kpiCode} ของ ${item.unitName} ?`)) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/kpi/results/${item.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถลบ KPI รายหน่วยบริการได้");
      }

      setMessage(body.message || "ลบ KPI รายหน่วยบริการเรียบร้อยแล้ว");
      if (editingKpiResult?.id === item.id) {
        setEditingKpiResult(null);
      }
      await Promise.all([loadData(), loadKpiResults()]);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถลบ KPI รายหน่วยบริการได้");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="flex flex-col gap-4 rounded-3xl border bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
            <Settings2 className="h-4 w-4" />
            Settings
          </div>
          <h1 className="text-3xl font-bold">จัดการผู้ใช้และข้อมูลระบบ</h1>
          <p className="max-w-2xl text-sm text-primary-foreground/80">
            หน้าสำหรับดูภาพรวมระบบ จัดการบัญชีผู้ใช้ และตรวจสอบข้อมูลหลักที่ใช้ในแดชบอร์ด
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
          <p className="font-medium">
            {status === "authenticated" ? currentUser?.name || "เข้าสู่ระบบแล้ว" : "ยังไม่ได้เข้าสู่ระบบ"}
          </p>
          <p className="text-primary-foreground/80">
            {status === "authenticated"
              ? `สิทธิ์: ${currentUser?.role ? roleLabels[currentUser.role] : "ผู้ใช้งาน"}`
              : "คุณยังสามารถตรวจสอบข้อมูลระบบได้จากหน้านี้"}
          </p>
        </div>
      </section>

      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="users" className="rounded-full border px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            ผู้ใช้
          </TabsTrigger>
          <TabsTrigger value="units" className="rounded-full border px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            หน่วยบริการ
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-full border px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            ข้อมูลKPI
          </TabsTrigger>
          <TabsTrigger value="finance" className="rounded-full border px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            การเงิน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard icon={Users} label="จำนวนผู้ใช้ทั้งหมด" value={formatNumber(users.length)} />
            <SummaryCard icon={UserCog} label="ผู้ใช้ที่เปิดใช้งาน" value={formatNumber(users.filter((user) => user.isActive).length)} />
            <SummaryCard icon={Building2} label="ผู้ใช้ที่ผูกหน่วยบริการ" value={formatNumber(users.filter((user) => user.healthUnitId).length)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">เพิ่มผู้ใช้</CardTitle>
                <CardDescription>สร้างบัญชีผู้ใช้ใหม่และกำหนดสิทธิ์การใช้งาน</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateUser}>
                  <FormInput label="ชื่อ - นามสกุล" value={createForm.name} onChange={(value) => setCreateForm((current) => ({ ...current, name: value }))} />
                  <FormInput label="อีเมล" type="email" value={createForm.email} onChange={(value) => setCreateForm((current) => ({ ...current, email: value }))} />
                  <FormInput label="รหัสผ่าน" type="password" value={createForm.password} onChange={(value) => setCreateForm((current) => ({ ...current, password: value }))} />
                  <FormSelect
                    label="สิทธิ์การใช้งาน"
                    value={createForm.role}
                    onChange={(value) => setCreateForm((current) => ({ ...current, role: value as UserItem["role"] }))}
                    options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))}
                  />
                  <RoleDescriptionList selectedRole={createForm.role} />
                  <FormSelect
                    label="หน่วยบริการ"
                    value={createForm.healthUnitId}
                    onChange={(value) => setCreateForm((current) => ({ ...current, healthUnitId: value }))}
                    options={[
                      { value: "", label: "ไม่ผูกหน่วยบริการ" },
                      ...units.map((unit) => ({ value: String(unit.id), label: `${unit.code} - ${unit.name}` })),
                    ]}
                  />
                  <FormSelect
                    label="สถานะ"
                    value={createForm.isActive ? "active" : "inactive"}
                    onChange={(value) => setCreateForm((current) => ({ ...current, isActive: value === "active" }))}
                    options={[
                      { value: "active", label: "ใช้งาน" },
                      { value: "inactive", label: "ปิดใช้งาน" },
                    ]}
                  />
                  <Button type="submit" className="w-full" disabled={isSaving || !createForm.name || !createForm.email || !createForm.password}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isSaving ? "กำลังบันทึก..." : "เพิ่มผู้ใช้"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">จัดการผู้ใช้</CardTitle>
                  <CardDescription>แก้ไขสิทธิ์ ผูกหน่วยบริการ หรือปิดใช้งานบัญชีผู้ใช้</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อ อีเมล หรือหน่วยบริการ" className="w-full md:w-72" />
                  <Button variant="outline" onClick={() => void handleImportUsers()} disabled={isImportingUsers || isLoading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isImportingUsers ? "กำลังนำเข้า..." : "นำเข้าผู้ใช้"}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => void loadData()} disabled={isLoading}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">ชื่อ</th>
                        <th className="pb-3 font-medium">อีเมล</th>
                        <th className="pb-3 font-medium">สิทธิ์</th>
                        <th className="pb-3 font-medium">หน่วยบริการ</th>
                        <th className="pb-3 font-medium">สถานะ</th>
                        <th className="pb-3 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b last:border-b-0">
                          <td className="py-4 font-medium">{user.name}</td>
                          <td className="py-4 text-muted-foreground">{user.email}</td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                              {roleLabels[user.role]}
                            </span>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {user.healthUnit ? `${user.healthUnit.code || ""} ${user.healthUnit.name}`.trim() : "-"}
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                              {user.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                แก้ไข
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => void handleDeleteUser(user)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                ลบ
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!isLoading && filteredUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    ไม่พบผู้ใช้ตามคำค้นหา
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard icon={Building2} label="Health Units" value={formatNumber(units.length)} />
            <SummaryCard icon={Users} label="UC68 Population" value={formatNumber(units.reduce((sum, unit) => sum + (unit.ucPopulation68 || 0), 0))} />
            <SummaryCard icon={CalendarRange} label="Transfer Years" value={formatNumber(new Set(units.map((unit) => unit.transferYear).filter(Boolean)).size)} />
          </div>

          <Card>
            <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Manage Health Units</CardTitle>
                <CardDescription>Search, filter, edit, and remove health units imported into the system.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={unitSearch}
                  onChange={(event) => setUnitSearch(event.target.value)}
                  placeholder="Search code, name, district, subdistrict"
                  className="w-full md:w-72"
                />
                <Input
                  value={unitTransferYearFilter}
                  onChange={(event) => setUnitTransferYearFilter(event.target.value)}
                  placeholder="Transfer year"
                  className="w-32"
                />
                <select
                  value={unitSizeFilter}
                  onChange={(event) => setUnitSizeFilter(event.target.value)}
                  className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Size</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                </select>
                <Button variant="outline" onClick={() => void loadData()} disabled={isLoading}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Code</th>
                      <th className="pb-3 font-medium">Health Unit</th>
                      <th className="pb-3 font-medium">Area</th>
                      <th className="pb-3 font-medium">Transfer</th>
                      <th className="pb-3 font-medium">UC</th>
                      <th className="pb-3 font-medium">Contact</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map((unit) => (
                      <tr key={unit.id} className="border-b last:border-b-0">
                        <td className="py-4 font-medium">{unit.code}</td>
                        <td className="py-4">
                          <div className="font-medium text-foreground">{unit.name}</div>
                          <div className="text-muted-foreground">{unit.shortName || "-"}</div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          <div>{unit.amphoeName}</div>
                          <div>{unit.tambonName || "-"}</div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          <div>Year {unit.transferYear || "-"}</div>
                          <div>Size {unit.unitSize || "-"}</div>
                          <div>{unit.cupName || "-"}</div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          <div>UC66 {formatNumber(unit.ucPopulation66 || 0)}</div>
                          <div>UC67 {formatNumber(unit.ucPopulation67 || 0)}</div>
                          <div>UC68 {formatNumber(unit.ucPopulation68 || 0)}</div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          <div>{unit.phone || "-"}</div>
                          <div>{unit.localAuthority || unit.email || "-"}</div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(unit.status)}`}>
                            {unit.status === "active" ? "active" : "inactive"}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditUnitDialog(unit)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => void handleDeleteUnit(unit)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isLoading && filteredUnits.length === 0 ? (
                <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  No health units matched the current filters.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="data" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard icon={Building2} label="หน่วยบริการ" value={formatNumber(stats?.totalUnits)} />
            <SummaryCard icon={Users} label="ประชากรทั้งหมด" value={formatNumber(stats?.totalPopulation)} />
            <SummaryCard icon={Building2} label="หมู่บ้าน" value={formatNumber(stats?.totalVillages)} />
            <SummaryCard icon={CalendarRange} label="ปีงบประมาณ" value={formatNumber(years.length)} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard icon={Users} label="ประชากร UC68" value={formatNumber(units.reduce((sum, unit) => sum + (unit.ucPopulation68 || 0), 0))} />
            <SummaryCard icon={CalendarRange} label="จำนวนปีที่โอน" value={formatNumber(new Set(units.map((unit) => unit.transferYear).filter(Boolean)).size)} />
            <SummaryCard icon={Building2} label="จำนวน CUP" value={formatNumber(new Set(units.map((unit) => unit.cupCode).filter(Boolean)).size)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">เพิ่ม KPI Master</CardTitle>
                <CardDescription>สร้างตัวชี้วัดหลักใหม่สำหรับใช้งานในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateKpiDefinition}>
                  <FormSelect
                    label="หมวด KPI"
                    value={createKpiForm.categoryId}
                    onChange={(value) => setCreateKpiForm((current) => ({ ...current, categoryId: value }))}
                    options={[{ value: "", label: "เลือกหมวด" }, ...kpiCategories.map((item) => ({ value: String(item.id), label: getKpiCategoryLabel(item) }))]}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="รหัส KPI" value={createKpiForm.code} onChange={(value) => setCreateKpiForm((current) => ({ ...current, code: value }))} />
                    <FormInput label="หน่วยนับ" value={createKpiForm.unit} onChange={(value) => setCreateKpiForm((current) => ({ ...current, unit: value }))} />
                  </div>
                  <FormInput label="ชื่อ KPI" value={createKpiForm.nameTh} onChange={(value) => setCreateKpiForm((current) => ({ ...current, nameTh: value }))} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormInput label="ค่าเป้าหมาย" value={createKpiForm.targetValue} onChange={(value) => setCreateKpiForm((current) => ({ ...current, targetValue: value }))} />
                    <FormSelect
                      label="ประเภทเป้าหมาย"
                      value={createKpiForm.targetType}
                      onChange={(value) => setCreateKpiForm((current) => ({ ...current, targetType: value as "min" | "max" | "exact" }))}
                      options={[
                        { value: "min", label: "min" },
                        { value: "max", label: "max" },
                        { value: "exact", label: "exact" },
                      ]}
                    />
                    <FormInput label="ลำดับ" value={createKpiForm.displayOrder} onChange={(value) => setCreateKpiForm((current) => ({ ...current, displayOrder: value }))} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSaving || !createKpiForm.categoryId || !createKpiForm.code || !createKpiForm.nameTh}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isSaving ? "กำลังบันทึก..." : "เพิ่ม KPI Master"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">จัดการ KPI Master</CardTitle>
                  <CardDescription>แก้ไขและลบตัวชี้วัด โดยจะลบไม่ได้หากมีผลลัพธ์ KPI ผูกอยู่</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input value={kpiSearch} onChange={(event) => setKpiSearch(event.target.value)} placeholder="ค้นหารหัส KPI ชื่อ หรือหมวด" className="w-full md:w-72" />
                  <Button variant="outline" size="icon" onClick={() => void loadData()} disabled={isLoading}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">รหัส</th>
                        <th className="pb-3 font-medium">ชื่อ KPI</th>
                        <th className="pb-3 font-medium">หมวด</th>
                        <th className="pb-3 font-medium">เป้าหมาย</th>
                        <th className="pb-3 font-medium">ผลลัพธ์ที่ผูก</th>
                        <th className="pb-3 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKpis.map((item) => (
                        <tr key={item.id} className="border-b last:border-b-0">
                          <td className="py-4 font-medium">{item.code}</td>
                          <td className="py-4">
                            <div className="font-medium text-foreground">{item.nameTh}</div>
                            <div className="text-muted-foreground">{item.unit}</div>
                          </td>
                          <td className="py-4 text-muted-foreground">{getKpiCategoryLabel(item.category)}</td>
                          <td className="py-4 text-muted-foreground">
                            {item.targetValue ?? "-"} / {item.targetType}
                          </td>
                          <td className="py-4">{item._count.results}</td>
                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditKpiDialog(item)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                แก้ไข
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => void handleDeleteKpiDefinition(item)} disabled={item._count.results > 0}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                ลบ
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard icon={MapPinned} label="ผล KPI ที่แสดง" value={formatNumber(filteredKpiResults.length)} />
            <SummaryCard icon={Building2} label="หน่วยบริการที่มีข้อมูล" value={formatNumber(new Set(filteredKpiResults.map((item) => item.healthUnitId)).size)} />
            <SummaryCard icon={CalendarRange} label="ฉบับร่าง" value={formatNumber(filteredKpiResults.filter((item) => item.reviewStatus === "draft").length)} />
            <SummaryCard icon={Users} label="ผ่านเป้าเฉลี่ย" value={`${filteredKpiResults.length ? Math.round(filteredKpiResults.reduce((sum, item) => sum + item.percentage, 0) / filteredKpiResults.length) : 0}%`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">เพิ่ม KPI รายหน่วยบริการ</CardTitle>
                <CardDescription>บันทึกผลลัพธ์ KPI ของแต่ละหน่วยบริการตามงวดงบประมาณ</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateKpiResult}>
                  <FormSelect
                    label="หน่วยบริการ"
                    value={createKpiResultForm.healthUnitId}
                    onChange={(value) => setCreateKpiResultForm((current) => ({ ...current, healthUnitId: value }))}
                    options={[{ value: "", label: "เลือกหน่วยบริการ" }, ...units.map((unit) => ({ value: String(unit.id), label: `${unit.code} - ${unit.name}` }))]}
                  />
                  <FormSelect
                    label="งวดงบประมาณ"
                    value={createKpiResultForm.fiscalPeriodId}
                    onChange={(value) => setCreateKpiResultForm((current) => ({ ...current, fiscalPeriodId: value }))}
                    options={[
                      { value: "", label: "เลือกงวด" },
                      ...fiscalPeriods.map((period) => ({
                        value: String(period.id),
                        label: `ปี ${period.fiscalYear} Q${period.quarter} เดือน ${period.month} ${period.monthNameTh || ""}`.trim(),
                      })),
                    ]}
                  />
                  <FormSelect
                    label="KPI"
                    value={createKpiResultForm.kpiId}
                    onChange={(value) => fillKpiResultTargetValue(setCreateKpiResultForm, value)}
                    options={[{ value: "", label: "เลือก KPI" }, ...kpiDefinitions.filter((item) => item.isActive && !item.isDeleted).map((item) => ({ value: String(item.id), label: `${item.code} - ${item.nameTh}` }))]}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="ค่าเป้าหมาย" value={createKpiResultForm.targetValue} onChange={(value) => setCreateKpiResultForm((current) => ({ ...current, targetValue: value }))} />
                    <FormInput label="ค่าผลงาน" value={createKpiResultForm.actualValue} onChange={(value) => setCreateKpiResultForm((current) => ({ ...current, actualValue: value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">หมายเหตุ</label>
                    <textarea
                      value={createKpiResultForm.notes}
                      onChange={(event) => setCreateKpiResultForm((current) => ({ ...current, notes: event.target.value }))}
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isSaving ||
                      !createKpiResultForm.healthUnitId ||
                      !createKpiResultForm.kpiId ||
                      !createKpiResultForm.fiscalPeriodId ||
                      createKpiResultForm.targetValue === "" ||
                      createKpiResultForm.actualValue === ""
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isSaving ? "กำลังบันทึก..." : "เพิ่ม KPI รายหน่วยบริการ"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-4">
                <div className="md:flex md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-xl">จัดการ KPI รายหน่วยบริการ</CardTitle>
                    <CardDescription>ค้นหา กรอง แก้ไข และลบผล KPI ของแต่ละหน่วยบริการ</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={kpiResultSearch}
                    onChange={(event) => setKpiResultSearch(event.target.value)}
                    placeholder="ค้นหา KPI หรือหน่วยบริการ"
                    className="w-full md:w-72"
                  />
                  <select
                    value={kpiResultYearFilter}
                    onChange={(event) => setKpiResultYearFilter(event.target.value)}
                    className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">ทุกปีงบประมาณ</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={kpiResultCategoryFilter}
                    onChange={(event) => setKpiResultCategoryFilter(event.target.value)}
                    className="flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">ทุกหมวด KPI</option>
                    {kpiCategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getKpiCategoryLabel(item)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={kpiResultUnitFilter}
                    onChange={(event) => setKpiResultUnitFilter(event.target.value)}
                    className="flex h-10 min-w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">ทุกหน่วยบริการ</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" size="icon" onClick={() => void loadKpiResults()} disabled={isKpiResultsLoading}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1180px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">หน่วยบริการ</th>
                        <th className="pb-3 font-medium">KPI</th>
                        <th className="pb-3 font-medium">งวด</th>
                        <th className="pb-3 font-medium">เป้าหมาย</th>
                        <th className="pb-3 font-medium">ผลงาน</th>
                        <th className="pb-3 font-medium">% ผลลัพธ์</th>
                        <th className="pb-3 font-medium">สถานะ</th>
                        <th className="pb-3 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKpiResults.map((item) => (
                        <tr key={item.id} className="border-b last:border-b-0">
                          <td className="py-4">
                            <div className="font-medium">{item.unitName}</div>
                            <div className="text-muted-foreground">{item.unitCode}</div>
                          </td>
                          <td className="py-4">
                            <div className="font-medium">{item.kpiNameTh}</div>
                            <div className="text-muted-foreground">
                              {item.kpiCode} / {item.categoryNameTh}
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            ปี {item.fiscalYear} Q{item.quarter} เดือน {item.month}
                          </td>
                          <td className="py-4">{item.targetValue}</td>
                          <td className="py-4">{item.actualValue}</td>
                          <td className="py-4">{item.percentage}%</td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getReviewStatusBadgeClass(item.reviewStatus)}`}>
                              {getReviewStatusLabel(item.reviewStatus)}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditKpiResultDialog(item)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                แก้ไข
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => void handleDeleteKpiResult(item)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                ลบ
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!isKpiResultsLoading && filteredKpiResults.length === 0 ? (
                  <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    ไม่พบข้อมูล KPI รายหน่วยบริการตามเงื่อนไขที่เลือก
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="finance" className="space-y-6">
          <FinanceSettingsSection
            units={units.map((unit) => ({ id: unit.id, code: unit.code, name: unit.name }))}
            fiscalPeriods={fiscalPeriods}
            years={years}
            currentPeriod={currentPeriod}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => (!open ? setEditingUser(null) : null)}>
        <DialogContent className={dialogContentClassName}>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
            <DialogDescription>อัปเดตข้อมูลผู้ใช้หน่วยบริการ สิทธิ์การใช้งาน และสถานะการเข้าถึง</DialogDescription>
          </DialogHeader>
          <form className={dialogFormClassName} onSubmit={handleUpdateUser}>
            <div className={dialogBodyClassName}>
              <FormInput label="ชื่อ - นามสกุล" value={editForm.name} onChange={(value) => setEditForm((current) => ({ ...current, name: value }))} />
              <FormInput label="อีเมล" value={editForm.email} onChange={() => undefined} disabled />
              <FormSelect
                label="สิทธิ์การใช้งาน"
                value={editForm.role}
                onChange={(value) => setEditForm((current) => ({ ...current, role: value as UserItem["role"] }))}
                options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))}
              />
              <RoleDescriptionList selectedRole={editForm.role} />
              <FormSelect
                label="หน่วยบริการ"
                value={editForm.healthUnitId}
                onChange={(value) => setEditForm((current) => ({ ...current, healthUnitId: value }))}
                options={[
                  { value: "", label: "ไม่มีผู้ใช้หน่วยบริการ" },
                  ...units.map((unit) => ({ value: String(unit.id), label: `${unit.code} - ${unit.name}` })),
                ]}
              />
              <FormSelect
                label="สถานะ"
                value={editForm.isActive ? "active" : "inactive"}
                onChange={(value) => setEditForm((current) => ({ ...current, isActive: value === "active" }))}
                options={[
                  { value: "active", label: "ใช้งาน" },
                  { value: "inactive", label: "ปิดใช้งาน" },
                ]}
              />
            </div>
            <DialogFooter className={dialogFooterClassName}>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูลผู้ใช้"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUnit)} onOpenChange={(open) => (!open ? setEditingUnit(null) : null)}>
        <DialogContent className={dialogContentWideClassName}>
          <DialogHeader>
            <DialogTitle>แก้ไขหน่วยบริการ</DialogTitle>
            <DialogDescription>ปรับข้อมูลหลักของหน่วยบริการ รวมถึงรหัส อำเภอ และตำบล</DialogDescription>
          </DialogHeader>
          <form className={dialogFormClassName} onSubmit={handleUpdateUnit}>
            <div className={dialogBodyClassName}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="รหัสหน่วยบริการ" value={editUnitForm.code} onChange={(value) => setEditUnitForm((current) => ({ ...current, code: value }))} />
                <FormInput label="ชื่อย่อ" value={editUnitForm.shortName} onChange={(value) => setEditUnitForm((current) => ({ ...current, shortName: value }))} />
              </div>
              <FormInput label="ชื่อหน่วยบริการ" value={editUnitForm.name} onChange={(value) => setEditUnitForm((current) => ({ ...current, name: value }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <FormSelect
                  label="อำเภอ"
                  value={editUnitForm.amphoeId}
                  onChange={(value) => setEditUnitForm((current) => ({ ...current, amphoeId: value, tambonId: "" }))}
                  options={[{ value: "", label: "เลือกอำเภอ" }, ...districts.map((item) => ({ value: String(item.id), label: item.nameTh }))]}
                />
                <FormSelect
                  label="ตำบล"
                  value={editUnitForm.tambonId}
                  onChange={(value) => setEditUnitForm((current) => ({ ...current, tambonId: value }))}
                  options={[{ value: "", label: "ไม่ระบุ" }, ...editSubdistricts.map((item) => ({ value: String(item.id), label: item.nameTh }))]}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="หมู่" value={editUnitForm.moo} onChange={(value) => setEditUnitForm((current) => ({ ...current, moo: value }))} />
                <FormSelect
                  label="สถานะ"
                  value={editUnitForm.status}
                  onChange={(value) => setEditUnitForm((current) => ({ ...current, status: value as "active" | "inactive" }))}
                  options={[
                    { value: "active", label: "ใช้งาน" },
                    { value: "inactive", label: "ปิดใช้งาน" },
                  ]}
                />
              </div>
              <FormInput label="สังกัด" value={editUnitForm.affiliation} onChange={(value) => setEditUnitForm((current) => ({ ...current, affiliation: value }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="อีเมล" type="email" value={editUnitForm.email} onChange={(value) => setEditUnitForm((current) => ({ ...current, email: value }))} />
                <FormInput label="โทรศัพท์" value={editUnitForm.phone} onChange={(value) => setEditUnitForm((current) => ({ ...current, phone: value }))} />
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium">ข้อมูลถ่ายโอน</p>
                  <p className="text-xs text-muted-foreground">แก้ไขปีโอน ขนาดหน่วยบริการ CUP และประชากร UC</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FormInput label="ปีโอน" value={editUnitForm.transferYear} onChange={(value) => setEditUnitForm((current) => ({ ...current, transferYear: value }))} />
                  <FormInput label="Size" value={editUnitForm.unitSize} onChange={(value) => setEditUnitForm((current) => ({ ...current, unitSize: value }))} />
                  <FormInput label="รหัส CUP" value={editUnitForm.cupCode} onChange={(value) => setEditUnitForm((current) => ({ ...current, cupCode: value }))} />
                  <FormInput label="ชื่อ CUP" value={editUnitForm.cupName} onChange={(value) => setEditUnitForm((current) => ({ ...current, cupName: value }))} />
                  <FormInput label="สังกัด อปท." value={editUnitForm.localAuthority} onChange={(value) => setEditUnitForm((current) => ({ ...current, localAuthority: value }))} />
                  <FormInput label="จังหวัด" value={editUnitForm.province} onChange={(value) => setEditUnitForm((current) => ({ ...current, province: value }))} />
                  <FormInput label="ปชก.UC66" value={editUnitForm.ucPopulation66} onChange={(value) => setEditUnitForm((current) => ({ ...current, ucPopulation66: value }))} />
                  <FormInput label="ปชก.UC67" value={editUnitForm.ucPopulation67} onChange={(value) => setEditUnitForm((current) => ({ ...current, ucPopulation67: value }))} />
                  <FormInput label="ปชก.UC68" value={editUnitForm.ucPopulation68} onChange={(value) => setEditUnitForm((current) => ({ ...current, ucPopulation68: value }))} />
                </div>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium">ข้อมูลพื้นฐานหน่วยบริการ</p>
                  <p className="text-xs text-muted-foreground">
                    บันทึกลงข้อมูลงวดปัจจุบัน {currentPeriod ? `(ปี ${currentPeriod.fiscalYear} ไตรมาส ${currentPeriod.quarter} เดือน ${currentPeriod.month})` : ""}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FormInput label="ประชากรรวม" value={editUnitForm.totalPopulation} onChange={(value) => setEditUnitForm((current) => ({ ...current, totalPopulation: value }))} />
                  <FormInput label="อสม." value={editUnitForm.healthVolunteers} onChange={(value) => setEditUnitForm((current) => ({ ...current, healthVolunteers: value }))} />
                  <FormInput label="ชาย" value={editUnitForm.male} onChange={(value) => setEditUnitForm((current) => ({ ...current, male: value }))} />
                  <FormInput label="หญิง" value={editUnitForm.female} onChange={(value) => setEditUnitForm((current) => ({ ...current, female: value }))} />
                  <FormInput label="ผู้สูงอายุ" value={editUnitForm.elderlyPopulation} onChange={(value) => setEditUnitForm((current) => ({ ...current, elderlyPopulation: value }))} />
                  <FormInput label="หมู่บ้าน" value={editUnitForm.villages} onChange={(value) => setEditUnitForm((current) => ({ ...current, villages: value }))} />
                  <FormInput label="หลังคาเรือน" value={editUnitForm.households} onChange={(value) => setEditUnitForm((current) => ({ ...current, households: value }))} />
                  <FormInput label="วัด/สำนักสงฆ์" value={editUnitForm.templeCount} onChange={(value) => setEditUnitForm((current) => ({ ...current, templeCount: value }))} />
                  <FormInput label="โรงเรียนประถม" value={editUnitForm.primarySchoolCount} onChange={(value) => setEditUnitForm((current) => ({ ...current, primarySchoolCount: value }))} />
                  <FormInput label="โรงเรียนขยายโอกาส" value={editUnitForm.opportunitySchoolCount} onChange={(value) => setEditUnitForm((current) => ({ ...current, opportunitySchoolCount: value }))} />
                  <FormInput label="โรงเรียนมัธยม" value={editUnitForm.secondarySchoolCount} onChange={(value) => setEditUnitForm((current) => ({ ...current, secondarySchoolCount: value }))} />
                  <FormInput label="ศูนย์พัฒนาเด็กเล็ก" value={editUnitForm.childDevelopmentCenterCount} onChange={(value) => setEditUnitForm((current) => ({ ...current, childDevelopmentCenterCount: value }))} />
                  <FormInput label="สถานีสุขภาพ" value={editUnitForm.healthStationCount} onChange={(value) => setEditUnitForm((current) => ({ ...current, healthStationCount: value }))} />
                </div>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium">ประวัติข้อมูลประชากร</p>
                  <p className="text-xs text-muted-foreground">แสดงข้อมูลรายงวดทั้งหมดของหน่วยบริการนี้ และสามารถลบทีละรายการได้</p>
                </div>
                <div className="space-y-3">
                  {unitDemographicHistory.map((item) => (
                    <div key={item.id} className="rounded-xl border bg-background px-4 py-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            ปี {item.fiscalPeriod.fiscalYear} ไตรมาส {item.fiscalPeriod.quarter} เดือน {item.fiscalPeriod.month} {item.fiscalPeriod.monthNameTh}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ประชากร {formatNumber(item.totalPopulation ?? 0)} คน, ชาย {formatNumber(item.male ?? 0)}, หญิง {formatNumber(item.female ?? 0)}, หลังคาเรือน {formatNumber(item.households ?? 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            หมู่บ้าน {formatNumber(item.villages ?? 0)}, อสม. {formatNumber(item.healthVolunteers ?? 0)}, ผู้สูงอายุ {formatNumber(item.elderlyPopulation ?? 0)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => void handleDeleteDemographicHistory(item)} disabled={isSaving}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          ลบรายการนี้
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!unitDemographicHistory.length ? (
                    <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                      ยังไม่มีประวัติข้อมูลประชากรของหน่วยบริการนี้
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <DialogFooter className={dialogFooterClassName}>
              <Button type="button" variant="outline" onClick={() => setEditingUnit(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึกหน่วยบริการ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingPeriod)} onOpenChange={(open) => (!open ? setEditingPeriod(null) : null)}>
        <DialogContent className={dialogContentClassName}>
          <DialogHeader>
            <DialogTitle>แก้ไขงวดปีงบประมาณ</DialogTitle>
            <DialogDescription>ปรับชื่อเดือน วันที่เริ่มต้น สิ้นสุด และสถานะการปิดงวด</DialogDescription>
          </DialogHeader>
          <form className={dialogFormClassName} onSubmit={handleUpdatePeriod}>
            <div className={dialogBodyClassName}>
              <FormInput
                label="ชื่อเดือน"
                value={editingPeriod?.monthNameTh || ""}
                onChange={(value) => setEditingPeriod((current) => (current ? { ...current, monthNameTh: value } : current))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="วันที่เริ่มต้น"
                  type="date"
                  value={editingPeriod?.startDate ? new Date(editingPeriod.startDate).toISOString().slice(0, 10) : ""}
                  onChange={(value) => setEditingPeriod((current) => (current ? { ...current, startDate: value } : current))}
                />
                <FormInput
                  label="วันที่สิ้นสุด"
                  type="date"
                  value={editingPeriod?.endDate ? new Date(editingPeriod.endDate).toISOString().slice(0, 10) : ""}
                  onChange={(value) => setEditingPeriod((current) => (current ? { ...current, endDate: value } : current))}
                />
              </div>
              <FormSelect
                label="สถานะงวด"
                value={editingPeriod?.isClosed ? "closed" : "open"}
                onChange={(value) => setEditingPeriod((current) => (current ? { ...current, isClosed: value === "closed" } : current))}
                options={[
                  { value: "open", label: "เปิดงวด" },
                  { value: "closed", label: "ปิดงวด" },
                ]}
              />
            </div>
            <DialogFooter className={dialogFooterClassName}>
              <Button type="button" variant="outline" onClick={() => setEditingPeriod(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึกงวดปีงบประมาณ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingKpi)} onOpenChange={(open) => (!open ? setEditingKpi(null) : null)}>
        <DialogContent className={dialogContentWideClassName}>
          <DialogHeader>
            <DialogTitle>แก้ไข KPI Master</DialogTitle>
            <DialogDescription>ปรับรหัส ชื่อ หมวด เป้าหมาย และสถานะของตัวชี้วัด</DialogDescription>
          </DialogHeader>
          <form className={dialogFormClassName} onSubmit={handleUpdateKpiDefinition}>
            <div className={dialogBodyClassName}>
              <FormSelect
                label="หมวด KPI"
                value={editKpiForm.categoryId}
                onChange={(value) => setEditKpiForm((current) => ({ ...current, categoryId: value }))}
                options={[{ value: "", label: "เลือกหมวด" }, ...kpiCategories.map((item) => ({ value: String(item.id), label: getKpiCategoryLabel(item) }))]}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="รหัส KPI" value={editKpiForm.code} onChange={(value) => setEditKpiForm((current) => ({ ...current, code: value }))} />
                <FormInput label="หน่วยนับ" value={editKpiForm.unit} onChange={(value) => setEditKpiForm((current) => ({ ...current, unit: value }))} />
              </div>
              <FormInput label="ชื่อ KPI" value={editKpiForm.nameTh} onChange={(value) => setEditKpiForm((current) => ({ ...current, nameTh: value }))} />
              <div className="grid gap-4 md:grid-cols-3">
                <FormInput label="ค่าเป้าหมาย" value={editKpiForm.targetValue} onChange={(value) => setEditKpiForm((current) => ({ ...current, targetValue: value }))} />
                <FormSelect
                  label="ประเภทเป้าหมาย"
                  value={editKpiForm.targetType}
                  onChange={(value) => setEditKpiForm((current) => ({ ...current, targetType: value as "min" | "max" | "exact" }))}
                  options={[
                    { value: "min", label: "min" },
                    { value: "max", label: "max" },
                    { value: "exact", label: "exact" },
                  ]}
                />
                <FormInput label="ลำดับ" value={editKpiForm.displayOrder} onChange={(value) => setEditKpiForm((current) => ({ ...current, displayOrder: value }))} />
              </div>
              <FormSelect
                label="สถานะ"
                value={editKpiForm.isActive ? "active" : "inactive"}
                onChange={(value) => setEditKpiForm((current) => ({ ...current, isActive: value === "active" }))}
                options={[
                  { value: "active", label: "ใช้งาน" },
                  { value: "inactive", label: "ปิดใช้งาน" },
                ]}
              />
            </div>
            <DialogFooter className={dialogFooterClassName}>
              <Button type="button" variant="outline" onClick={() => setEditingKpi(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึก KPI Master"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingKpiResult)} onOpenChange={(open) => (!open ? setEditingKpiResult(null) : null)}>
        <DialogContent className={dialogContentWideClassName}>
          <DialogHeader>
            <DialogTitle>แก้ไข KPI รายหน่วยบริการ</DialogTitle>
            <DialogDescription>ปรับค่าเป้าหมาย ค่าผลงาน และหมายเหตุของ KPI ที่บันทึกไว้</DialogDescription>
          </DialogHeader>
          <form className={dialogFormClassName} onSubmit={handleUpdateKpiResult}>
            <div className={dialogBodyClassName}>
              <div className="grid gap-4 md:grid-cols-3">
                <FormInput label="หน่วยบริการ" value={editingKpiResult ? `${editingKpiResult.unitCode} - ${editingKpiResult.unitName}` : ""} onChange={() => undefined} disabled />
                <FormInput label="KPI" value={editingKpiResult ? `${editingKpiResult.kpiCode} - ${editingKpiResult.kpiNameTh}` : ""} onChange={() => undefined} disabled />
                <FormInput
                  label="งวดงบประมาณ"
                  value={editingKpiResult ? `ปี ${editingKpiResult.fiscalYear} Q${editingKpiResult.quarter} เดือน ${editingKpiResult.month}` : ""}
                  onChange={() => undefined}
                  disabled
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="ค่าเป้าหมาย" value={editKpiResultForm.targetValue} onChange={(value) => setEditKpiResultForm((current) => ({ ...current, targetValue: value }))} />
                <FormInput label="ค่าผลงาน" value={editKpiResultForm.actualValue} onChange={(value) => setEditKpiResultForm((current) => ({ ...current, actualValue: value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">หมายเหตุ</label>
                <textarea
                  value={editKpiResultForm.notes}
                  onChange={(event) => setEditKpiResultForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            <DialogFooter className={dialogFooterClassName}>
              <Button type="button" variant="outline" onClick={() => setEditingKpiResult(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึก KPI รายหน่วยบริการ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingKpiCategory)} onOpenChange={(open) => (!open ? setEditingKpiCategory(null) : null)}>
        <DialogContent className={dialogContentClassName}>
          <DialogHeader>
            <DialogTitle>แก้ไขหมวด KPI</DialogTitle>
            <DialogDescription>ปรับรหัส ชื่อหมวด ลำดับ และสถานะการใช้งาน</DialogDescription>
          </DialogHeader>
          <form className={dialogFormClassName} onSubmit={handleUpdateKpiCategory}>
            <div className={dialogBodyClassName}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="รหัสหมวด" value={editKpiCategoryForm.code} onChange={(value) => setEditKpiCategoryForm((current) => ({ ...current, code: value }))} />
                <FormInput label="ลำดับ" value={editKpiCategoryForm.displayOrder} onChange={(value) => setEditKpiCategoryForm((current) => ({ ...current, displayOrder: value }))} />
              </div>
              <FormInput label="ชื่อหมวด" value={editKpiCategoryForm.nameTh} onChange={(value) => setEditKpiCategoryForm((current) => ({ ...current, nameTh: value }))} />
              <FormInput label="ชื่ออังกฤษ" value={editKpiCategoryForm.nameEn} onChange={(value) => setEditKpiCategoryForm((current) => ({ ...current, nameEn: value }))} />
              <FormSelect
                label="สถานะ"
                value={editKpiCategoryForm.isActive ? "active" : "inactive"}
                onChange={(value) => setEditKpiCategoryForm((current) => ({ ...current, isActive: value === "active" }))}
                options={[
                  { value: "active", label: "ใช้งาน" },
                  { value: "inactive", label: "ปิดใช้งาน" },
                ]}
              />
            </div>
            <DialogFooter className={dialogFooterClassName}>
              <Button type="button" variant="outline" onClick={() => setEditingKpiCategory(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึกหมวด KPI"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {options.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
