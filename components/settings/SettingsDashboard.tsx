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
  status: "active" | "inactive";
};

type HealthUnitDetailItem = HealthUnitItem & {
  demographics: {
    totalPopulation: number | null;
    male: number | null;
    female: number | null;
    villages: number | null;
    households: number | null;
    healthVolunteers: number | null;
  } | null;
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
  male: string;
  female: string;
  totalPopulation: string;
  villages: string;
  households: string;
  healthVolunteers: string;
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
  male: "0",
  female: "0",
  totalPopulation: "0",
  villages: "0",
  households: "0",
  healthVolunteers: "0",
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

const roleLabels: Record<UserItem["role"], string> = {
  admin: "ผู้ดูแลระบบ",
  manager: "ผู้จัดการ",
  staff: "เจ้าหน้าที่",
  viewer: "ผู้ดูข้อมูล",
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
  const [currentPeriod, setCurrentPeriod] = useState<FiscalPeriodItem | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState<UserFormState>(emptyUserForm);
  const [editForm, setEditForm] = useState<UserFormState>(emptyUserForm);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [search, setSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [fiscalYearForm, setFiscalYearForm] = useState<FiscalYearFormState>(emptyFiscalYearForm);
  const [editingPeriod, setEditingPeriod] = useState<FiscalPeriodItem | null>(null);
  const [kpiSearch, setKpiSearch] = useState("");
  const [createKpiForm, setCreateKpiForm] = useState<KpiDefinitionFormState>(emptyKpiForm);
  const [createKpiCategoryForm, setCreateKpiCategoryForm] = useState<KpiCategoryFormState>(emptyKpiCategoryForm);
  const [editingKpi, setEditingKpi] = useState<KpiDefinitionAdminItem | null>(null);
  const [editKpiForm, setEditKpiForm] = useState<KpiDefinitionFormState>(emptyKpiForm);
  const [editingKpiCategory, setEditingKpiCategory] = useState<KpiCategoryItem | null>(null);
  const [editKpiCategoryForm, setEditKpiCategoryForm] = useState<KpiCategoryFormState>(emptyKpiCategoryForm);
  const [createUnitForm, setCreateUnitForm] = useState<UnitFormState>(emptyUnitForm);
  const [editingUnit, setEditingUnit] = useState<HealthUnitItem | null>(null);
  const [editUnitForm, setEditUnitForm] = useState<UnitFormState>(emptyUnitForm);

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
    void loadSubdistricts(createUnitForm.amphoeId, "create");
  }, [createUnitForm.amphoeId]);

  useEffect(() => {
    void loadSubdistricts(editUnitForm.amphoeId, "edit");
  }, [editUnitForm.amphoeId]);

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
    if (!keyword) {
      return units;
    }

    return units.filter((unit) => {
      return (
        unit.code.toLowerCase().includes(keyword) ||
        unit.name.toLowerCase().includes(keyword) ||
        unit.amphoeName.toLowerCase().includes(keyword) ||
        (unit.tambonName || "").toLowerCase().includes(keyword)
      );
    });
  }, [unitSearch, units]);

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

  function resetFeedback() {
    setMessage("");
    setError("");
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

      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถสร้างผู้ใช้ได้");
      }

      setMessage(body.message || "สร้างผู้ใช้เรียบร้อยแล้ว");
      setCreateForm(emptyUserForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถสร้างผู้ใช้ได้");
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

      const body = (await response.json()) as { error?: string; message?: string };
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
      const body = (await response.json()) as { error?: string; message?: string };

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
      male: "0",
      female: "0",
      totalPopulation: "0",
      villages: "0",
      households: "0",
      healthVolunteers: "0",
      status: unit.status,
    };

    setEditingUnit(unit);
    setEditUnitForm(baseForm);

    if (!currentPeriod?.id) {
      return;
    }

    try {
      const detail = await fetchJson<HealthUnitDetailItem>(`/api/health-units/${unit.id}?demographics=true&fiscalPeriodId=${currentPeriod.id}`);
      setEditUnitForm({
        ...baseForm,
        male: String(detail.demographics?.male ?? 0),
        female: String(detail.demographics?.female ?? 0),
        totalPopulation: String(detail.demographics?.totalPopulation ?? 0),
        villages: String(detail.demographics?.villages ?? 0),
        households: String(detail.demographics?.households ?? 0),
        healthVolunteers: String(detail.demographics?.healthVolunteers ?? 0),
      });
    } catch {
      setEditUnitForm(baseForm);
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
        }),
      });

      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถเพิ่มหน่วยบริการได้");
      }

      setMessage(body.message || "เพิ่มหน่วยบริการเรียบร้อยแล้ว");
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
          status: editUnitForm.status,
        }),
      });

      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถแก้ไขหน่วยบริการได้");
      }

      if (currentPeriod?.id) {
        const demographicsResponse = await fetch(`/api/health-units/${editingUnit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fiscalPeriodId: currentPeriod.id,
            male: Number(editUnitForm.male || "0"),
            female: Number(editUnitForm.female || "0"),
            totalPopulation: Number(editUnitForm.totalPopulation || "0"),
            villages: Number(editUnitForm.villages || "0"),
            households: Number(editUnitForm.households || "0"),
            healthVolunteers: Number(editUnitForm.healthVolunteers || "0"),
          }),
        });

        const demographicsBody = (await demographicsResponse.json()) as { error?: string };
        if (!demographicsResponse.ok) {
          throw new Error(demographicsBody.error || "ไม่สามารถบันทึกข้อมูลประชากรได้");
        }
      }

      setMessage(body.message || "อัปเดตหน่วยบริการเรียบร้อยแล้ว");
      setEditingUnit(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถแก้ไขหน่วยบริการได้");
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
        throw new Error(body.error || "ไม่สามารถเพิ่มปีงบประมาณได้");
      }
      setMessage(body.message || "เพิ่มปีงบประมาณเรียบร้อยแล้ว");
      setFiscalYearForm(emptyFiscalYearForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่มปีงบประมาณได้");
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
        throw new Error(body.error || "ไม่สามารถลบปีงบประมาณได้");
      }
      setMessage(body.message || "ลบปีงบประมาณเรียบร้อยแล้ว");
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถลบปีงบประมาณได้");
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
        throw new Error(body.error || "ไม่สามารถแก้ไขงวดปีงบประมาณได้");
      }
      setMessage(body.message || "บันทึกงวดปีงบประมาณเรียบร้อยแล้ว");
      setEditingPeriod(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถแก้ไขงวดปีงบประมาณได้");
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
        throw new Error(body.error || "ไม่สามารถเพิ่ม KPI master ได้");
      }
      setMessage(body.message || "เพิ่ม KPI master เรียบร้อยแล้ว");
      setCreateKpiForm(emptyKpiForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่ม KPI master ได้");
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
        throw new Error(body.error || "ไม่สามารถเพิ่มหมวด KPI ได้");
      }
      setMessage(body.message || "เพิ่มหมวด KPI เรียบร้อยแล้ว");
      setCreateKpiCategoryForm(emptyKpiCategoryForm);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถเพิ่มหมวด KPI ได้");
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
        throw new Error(body.error || "ไม่สามารถแก้ไขหมวด KPI ได้");
      }
      setMessage(body.message || "แก้ไขหมวด KPI เรียบร้อยแล้ว");
      setEditingKpiCategory(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถแก้ไขหมวด KPI ได้");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteKpiCategory(item: KpiCategoryItem) {
    if (!window.confirm(`ยืนยันการลบหมวด KPI ${getKpiCategoryLabel(item)} ?`)) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/kpi-categories/${item.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ไม่สามารถลบหมวด KPI ได้");
      }
      setMessage(body.message || "ลบหมวด KPI เรียบร้อยแล้ว");
      if (editingKpiCategory?.id === item.id) {
        setEditingKpiCategory(null);
      }
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ไม่สามารถลบหมวด KPI ได้");
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
        throw new Error(body.error || "ไม่สามารถแก้ไข KPI master ได้");
      }
      setMessage(body.message || "แก้ไข KPI master เรียบร้อยแล้ว");
      setEditingKpi(null);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "ไม่สามารถแก้ไข KPI master ได้");
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
            หน้าเดียวสำหรับดูภาพรวมระบบ จัดการบัญชีผู้ใช้ และตรวจสอบข้อมูลหลักที่ใช้ในแดชบอร์ด
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
            ข้อมูลระบบ
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
                <CardTitle className="text-xl">เพิ่มหมวด KPI</CardTitle>
                <CardDescription>จัดการหมวดเช่น PPFS และ แพทย์แผนไทย</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateKpiCategory}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="รหัสหมวด" value={createKpiCategoryForm.code} onChange={(value) => setCreateKpiCategoryForm((current) => ({ ...current, code: value }))} />
                    <FormInput label="ลำดับ" value={createKpiCategoryForm.displayOrder} onChange={(value) => setCreateKpiCategoryForm((current) => ({ ...current, displayOrder: value }))} />
                  </div>
                  <FormInput label="ชื่อหมวด" value={createKpiCategoryForm.nameTh} onChange={(value) => setCreateKpiCategoryForm((current) => ({ ...current, nameTh: value }))} />
                  <FormInput label="ชื่ออังกฤษ" value={createKpiCategoryForm.nameEn} onChange={(value) => setCreateKpiCategoryForm((current) => ({ ...current, nameEn: value }))} />
                  <FormSelect
                    label="สถานะ"
                    value={createKpiCategoryForm.isActive ? "active" : "inactive"}
                    onChange={(value) => setCreateKpiCategoryForm((current) => ({ ...current, isActive: value === "active" }))}
                    options={[
                      { value: "active", label: "active" },
                      { value: "inactive", label: "inactive" },
                    ]}
                  />
                  <Button type="submit" className="w-full" disabled={isSaving || !createKpiCategoryForm.code || !createKpiCategoryForm.nameTh}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isSaving ? "กำลังบันทึก..." : "เพิ่มหมวด KPI"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">จัดการหมวด KPI</CardTitle>
                <CardDescription>ลบไม่ได้หากยังมี KPI master ผูกอยู่</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">รหัส</th>
                        <th className="pb-3 font-medium">ชื่อแสดงผล</th>
                        <th className="pb-3 font-medium">ชื่อเต็ม</th>
                        <th className="pb-3 font-medium">KPI</th>
                        <th className="pb-3 font-medium">สถานะ</th>
                        <th className="pb-3 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpiCategories.map((item) => (
                        <tr key={item.id} className="border-b last:border-b-0">
                          <td className="py-4 font-medium">{item.code}</td>
                          <td className="py-4">{getKpiCategoryLabel(item)}</td>
                          <td className="py-4 text-muted-foreground">{item.nameTh}</td>
                          <td className="py-4">{item._count?.definitions ?? 0}</td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                              {item.isActive ? "active" : "inactive"}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditKpiCategoryDialog(item)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                แก้ไข
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => void handleDeleteKpiCategory(item)} disabled={(item._count?.definitions ?? 0) > 0}>
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

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">เพิ่มผู้ใช้ใหม่</CardTitle>
                <CardDescription>สร้างบัญชีสำหรับผู้ดูแล ผู้จัดการ หรือเจ้าหน้าที่</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateUser}>
                  <FormInput label="ชื่อ - นามสกุล" value={createForm.name} onChange={(value) => setCreateForm((current) => ({ ...current, name: value }))} />
                  <FormInput label="อีเมล" type="email" value={createForm.email} onChange={(value) => setCreateForm((current) => ({ ...current, email: value }))} />
                  <FormInput label="รหัสผ่าน" type="password" value={createForm.password} onChange={(value) => setCreateForm((current) => ({ ...current, password: value }))} placeholder="อย่างน้อย 8 ตัวอักษร" />
                  <FormSelect
                    label="สิทธิ์การใช้งาน"
                    value={createForm.role}
                    onChange={(value) => setCreateForm((current) => ({ ...current, role: value as UserItem["role"] }))}
                    options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))}
                  />
                  <FormSelect
                    label="หน่วยบริการ"
                    value={createForm.healthUnitId}
                    onChange={(value) => setCreateForm((current) => ({ ...current, healthUnitId: value }))}
                    options={[
                      { value: "", label: "ไม่ผูกหน่วยบริการ" },
                      ...units.map((unit) => ({ value: String(unit.id), label: `${unit.code} - ${unit.name}` })),
                    ]}
                  />
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? "กำลังบันทึก..." : "เพิ่มผู้ใช้"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">รายการผู้ใช้</CardTitle>
                  <CardDescription>ค้นหา แก้ไข และลบผู้ใช้จากระบบ</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อ อีเมล หรือหน่วยงาน" className="w-full md:w-72" />
                  <Button variant="outline" size="icon" onClick={() => void loadData()} disabled={isLoading}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">ชื่อผู้ใช้</th>
                        <th className="pb-3 font-medium">สิทธิ์</th>
                        <th className="pb-3 font-medium">หน่วยบริการ</th>
                        <th className="pb-3 font-medium">สถานะ</th>
                        <th className="pb-3 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b last:border-b-0">
                          <td className="py-4">
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-muted-foreground">{user.email}</div>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                              {roleLabels[user.role]}
                            </span>
                          </td>
                          <td className="py-4 text-muted-foreground">{user.healthUnit?.name || "-"}</td>
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
                    ไม่พบข้อมูลผู้ใช้ตามคำค้นหา
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard icon={Building2} label="หน่วยบริการทั้งหมด" value={formatNumber(units.length)} />
            <SummaryCard icon={MapPinned} label="อำเภอที่มีข้อมูล" value={formatNumber(new Set(units.map((unit) => unit.amphoeId)).size)} />
            <SummaryCard icon={Building2} label="หน่วยบริการ active" value={formatNumber(units.filter((unit) => unit.status === "active").length)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">เพิ่มหน่วยบริการ</CardTitle>
                <CardDescription>สร้างหน่วยบริการใหม่สำหรับใช้งานในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateUnit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="รหัสหน่วยบริการ" value={createUnitForm.code} onChange={(value) => setCreateUnitForm((current) => ({ ...current, code: value }))} />
                    <FormInput label="ชื่อย่อ" value={createUnitForm.shortName} onChange={(value) => setCreateUnitForm((current) => ({ ...current, shortName: value }))} />
                  </div>
                  <FormInput label="ชื่อหน่วยบริการ" value={createUnitForm.name} onChange={(value) => setCreateUnitForm((current) => ({ ...current, name: value }))} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormSelect
                      label="อำเภอ"
                      value={createUnitForm.amphoeId}
                      onChange={(value) => setCreateUnitForm((current) => ({ ...current, amphoeId: value, tambonId: "" }))}
                      options={[{ value: "", label: "เลือกอำเภอ" }, ...districts.map((item) => ({ value: String(item.id), label: item.nameTh }))]}
                    />
                    <FormSelect
                      label="ตำบล"
                      value={createUnitForm.tambonId}
                      onChange={(value) => setCreateUnitForm((current) => ({ ...current, tambonId: value }))}
                      options={[{ value: "", label: "ไม่ระบุ" }, ...createSubdistricts.map((item) => ({ value: String(item.id), label: item.nameTh }))]}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="หมู่" value={createUnitForm.moo} onChange={(value) => setCreateUnitForm((current) => ({ ...current, moo: value }))} />
                    <FormInput label="สังกัด" value={createUnitForm.affiliation} onChange={(value) => setCreateUnitForm((current) => ({ ...current, affiliation: value }))} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput label="อีเมล" type="email" value={createUnitForm.email} onChange={(value) => setCreateUnitForm((current) => ({ ...current, email: value }))} />
                    <FormInput label="โทรศัพท์" value={createUnitForm.phone} onChange={(value) => setCreateUnitForm((current) => ({ ...current, phone: value }))} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSaving || !createUnitForm.code || !createUnitForm.name || !createUnitForm.amphoeId}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isSaving ? "กำลังบันทึก..." : "เพิ่มหน่วยบริการ"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">จัดการหน่วยบริการ</CardTitle>
                  <CardDescription>เพิ่ม ลบ และแก้ไขข้อมูลหน่วยบริการในระบบ</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input value={unitSearch} onChange={(event) => setUnitSearch(event.target.value)} placeholder="ค้นหารหัส ชื่อ อำเภอ หรือตำบล" className="w-full md:w-72" />
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
                        <th className="pb-3 font-medium">ชื่อหน่วยบริการ</th>
                        <th className="pb-3 font-medium">อำเภอ / ตำบล</th>
                        <th className="pb-3 font-medium">ติดต่อ</th>
                        <th className="pb-3 font-medium">สถานะ</th>
                        <th className="pb-3 font-medium text-right">จัดการ</th>
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
                            <div>{unit.phone || "-"}</div>
                            <div>{unit.email || "-"}</div>
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
                                แก้ไข
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => void handleDeleteUnit(unit)}>
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
                {!isLoading && filteredUnits.length === 0 ? (
                  <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    ไม่พบข้อมูลหน่วยบริการตามคำค้นหา
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard icon={Building2} label="หน่วยบริการ" value={formatNumber(stats?.totalUnits)} />
            <SummaryCard icon={Users} label="ประชากรทั้งหมด" value={formatNumber(stats?.totalPopulation)} />
            <SummaryCard icon={Building2} label="หมู่บ้าน" value={formatNumber(stats?.totalVillages)} />
            <SummaryCard icon={CalendarRange} label="ปีงบประมาณ" value={formatNumber(years.length)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">ภาพรวมข้อมูลหลัก</CardTitle>
                <CardDescription>สรุปข้อมูลที่ระบบใช้งานร่วมกันในแดชบอร์ด</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DataRow label="ปีงบประมาณล่าสุด" value={years[0] ? `พ.ศ. ${years[0]}` : "-"} />
                <DataRow label="งวดปัจจุบัน" value={currentPeriod ? `ปี ${currentPeriod.fiscalYear} ไตรมาส ${currentPeriod.quarter} เดือน ${currentPeriod.month}` : "-"} />
                <DataRow label="จำนวนครัวเรือน" value={formatNumber(stats?.totalHouseholds)} />
                <DataRow label="อสม.ทั้งหมด" value={formatNumber(stats?.totalVolunteers)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">หน่วยบริการในระบบ</CardTitle>
                  <CardDescription>รายการหน่วยบริการที่ดึงได้จากฐานข้อมูลปัจจุบัน</CardDescription>
                </div>
                <Button variant="outline" onClick={() => void loadData()} disabled={isLoading}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  โหลดใหม่
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {units.slice(0, 8).map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                      <div>
                        <p className="font-medium">{unit.name}</p>
                        <p className="text-sm text-muted-foreground">{unit.code}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${unit.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                        {unit.status === "active" ? "active" : "inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">เพิ่มปีงบประมาณ</CardTitle>
                <CardDescription>ระบบจะสร้าง 12 งวดอัตโนมัติสำหรับปีงบประมาณที่ระบุ</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateFiscalYear}>
                  <FormInput
                    label="ปีงบประมาณ"
                    value={fiscalYearForm.fiscalYear}
                    onChange={(value) => setFiscalYearForm({ fiscalYear: value })}
                    placeholder="เช่น 2568"
                  />
                  <Button type="submit" className="w-full" disabled={isSaving || !fiscalYearForm.fiscalYear}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isSaving ? "กำลังบันทึก..." : "เพิ่มปีงบประมาณ"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">จัดการปีงบประมาณ</CardTitle>
                <CardDescription>ลบได้เฉพาะปีที่ยังไม่มีข้อมูล KPI การเงิน หรือประชากรผูกอยู่</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">ปีงบประมาณ</th>
                        <th className="pb-3 font-medium">จำนวนงวด</th>
                        <th className="pb-3 font-medium">ปิดงวดแล้ว</th>
                        <th className="pb-3 font-medium">ข้อมูลที่ผูก</th>
                        <th className="pb-3 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fiscalYears.map((item) => (
                        <tr key={item.fiscalYear} className="border-b last:border-b-0">
                          <td className="py-4 font-medium">{item.fiscalYear}</td>
                          <td className="py-4">{item.periodCount}</td>
                          <td className="py-4">{item.closedCount}</td>
                          <td className="py-4 text-muted-foreground">
                            KPI {item.totalKpiResults} / การเงิน {item.totalFinanceRecords} / ประชากร {item.totalDemographics}
                          </td>
                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void handleDeleteFiscalYear(item.fiscalYear)}
                                disabled={item.hasUsage}
                              >
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
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">ปี</th>
                        <th className="pb-3 font-medium">ไตรมาส</th>
                        <th className="pb-3 font-medium">เดือน</th>
                        <th className="pb-3 font-medium">เริ่มต้น</th>
                        <th className="pb-3 font-medium">สิ้นสุด</th>
                        <th className="pb-3 font-medium">สถานะ</th>
                        <th className="pb-3 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fiscalPeriods.map((period) => (
                        <tr key={`${period.id}-${period.month}`} className="border-b last:border-b-0">
                          <td className="py-4">{period.fiscalYear}</td>
                          <td className="py-4">{period.quarter}</td>
                          <td className="py-4">{period.monthNameTh || period.month}</td>
                          <td className="py-4 text-muted-foreground">{period.startDate ? new Date(period.startDate).toLocaleDateString("th-TH") : "-"}</td>
                          <td className="py-4 text-muted-foreground">{period.endDate ? new Date(period.endDate).toLocaleDateString("th-TH") : "-"}</td>
                          <td className="py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${period.isClosed ? "bg-slate-200 text-slate-600" : "bg-green-100 text-green-700"}`}>
                              {period.isClosed ? "ปิดงวด" : "เปิดงวด"}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditPeriodDialog(period)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                แก้ไข
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
            <DialogDescription>อัปเดตชื่อ สิทธิ์ หน่วยบริการ และสถานะการใช้งาน</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateUser}>
            <FormInput label="ชื่อ - นามสกุล" value={editForm.name} onChange={(value) => setEditForm((current) => ({ ...current, name: value }))} />
            <FormInput label="อีเมล" value={editForm.email} onChange={() => undefined} disabled />
            <FormSelect
              label="สิทธิ์การใช้งาน"
              value={editForm.role}
              onChange={(value) => setEditForm((current) => ({ ...current, role: value as UserItem["role"] }))}
              options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))}
            />
            <FormSelect
              label="หน่วยบริการ"
              value={editForm.healthUnitId}
              onChange={(value) => setEditForm((current) => ({ ...current, healthUnitId: value }))}
              options={[
                { value: "", label: "ไม่ผูกหน่วยบริการ" },
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUnit)} onOpenChange={(open) => (!open ? setEditingUnit(null) : null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขหน่วยบริการ</DialogTitle>
            <DialogDescription>ปรับข้อมูลหลักของหน่วยบริการ รวมถึงรหัส อำเภอ และตำบล</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateUnit}>
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
                  { value: "active", label: "active" },
                  { value: "inactive", label: "inactive" },
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
                <p className="text-sm font-medium">ข้อมูลพื้นฐานหน่วยบริการ</p>
                <p className="text-xs text-muted-foreground">
                  บันทึกลงข้อมูลงวดปัจจุบัน {currentPeriod ? `(ปี ${currentPeriod.fiscalYear} ไตรมาส ${currentPeriod.quarter} เดือน ${currentPeriod.month})` : ""}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="ประชากรรวม" value={editUnitForm.totalPopulation} onChange={(value) => setEditUnitForm((current) => ({ ...current, totalPopulation: value }))} />
                <FormInput label="อสม." value={editUnitForm.healthVolunteers} onChange={(value) => setEditUnitForm((current) => ({ ...current, healthVolunteers: value }))} />
                <FormInput label="ชาย" value={editUnitForm.male} onChange={(value) => setEditUnitForm((current) => ({ ...current, male: value }))} />
                <FormInput label="หญิง" value={editUnitForm.female} onChange={(value) => setEditUnitForm((current) => ({ ...current, female: value }))} />
                <FormInput label="หมู่บ้าน" value={editUnitForm.villages} onChange={(value) => setEditUnitForm((current) => ({ ...current, villages: value }))} />
                <FormInput label="หลังคาเรือน" value={editUnitForm.households} onChange={(value) => setEditUnitForm((current) => ({ ...current, households: value }))} />
              </div>
            </div>
            <DialogFooter>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขงวดปีงบประมาณ</DialogTitle>
            <DialogDescription>ปรับชื่อเดือน วันที่เริ่มต้น สิ้นสุด และสถานะการปิดงวด</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdatePeriod}>
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
            <DialogFooter>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไข KPI Master</DialogTitle>
            <DialogDescription>ปรับรหัส ชื่อ หมวด เป้าหมาย และสถานะของตัวชี้วัด</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateKpiDefinition}>
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
                { value: "active", label: "active" },
                { value: "inactive", label: "inactive" },
              ]}
            />
            <DialogFooter>
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

      <Dialog open={Boolean(editingKpiCategory)} onOpenChange={(open) => (!open ? setEditingKpiCategory(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขหมวด KPI</DialogTitle>
            <DialogDescription>ปรับรหัส ชื่อหมวด ลำดับ และสถานะการใช้งาน</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateKpiCategory}>
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
                { value: "active", label: "active" },
                { value: "inactive", label: "inactive" },
              ]}
            />
            <DialogFooter>
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
