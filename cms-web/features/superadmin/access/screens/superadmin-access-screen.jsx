"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { PencilLine, Plus, Trash2 } from "lucide-react";

import { TableListingNoRecords } from "@/components/shared/table-listing-no-records";
import { TableListingSkeleton } from "@/components/shared/table-listing-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/utils";
import { SuperadminShell } from "@/features/superadmin/layout/superadmin-shell";
import {
  createSuperadminRole,
  createSuperadminUser,
  deleteSuperadminRole,
  deleteSuperadminUser,
  getSuperadminMenus,
  getSuperadminRoles,
  getSuperadminUsers,
  updateSuperadminRole,
  updateSuperadminUser,
} from "@/features/superadmin/access/services/superadmin-access-api";

const emptyRole = {
  name: "",
  code: "",
  description: "",
  status: "active",
  permissions: [],
};

const emptyUser = {
  name: "",
  email: "",
  password: "",
  roleId: "",
  status: "active",
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

function buildRolePermissions(menus, role) {
  const menusById = new Map(menus.map((menu) => [menu.id, menu]));

  return menus.map((menu) => {
    const existing = role?.permissions?.find(
      (permission) => permission.menuId === menu.id,
    );
    let depth = 0;
    let current = menu;

    while (current?.parentId && depth < 2) {
      depth += 1;
      current = menusById.get(current.parentId);
    }

    return {
      menuId: menu.id,
      menuTitle: `${"  ".repeat(depth)}${depth ? "- " : ""}${menu.title}`,
      canRead: Boolean(existing?.canRead),
      canWrite: Boolean(existing?.canWrite),
    };
  });
}

export function SuperadminAccessScreen() {
  const [activeTab, setActiveTab] = useState("roles");
  const [isLoading, setIsLoading] = useState(false);
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [userForm, setUserForm] = useState(emptyUser);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  const activeRoles = useMemo(
    () => roles.filter((role) => role.status === "active"),
    [roles],
  );

  const fetchAccessData = async () => {
    setIsLoading(true);
    try {
      const [menusRes, rolesRes, usersRes] = await Promise.all([
        getSuperadminMenus(),
        getSuperadminRoles(),
        getSuperadminUsers(),
      ]);

      setMenus(menusRes?.data?.data || []);
      setRoles(rolesRes?.data?.data || []);
      setUsers(usersRes?.data?.data || []);
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to load access control"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetRoleForm = () => {
    setEditingRoleId(null);
    setRoleForm({
      ...emptyRole,
      permissions: buildRolePermissions(menus, null),
    });
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(emptyUser);
  };

  useEffect(() => {
    fetchAccessData();
  }, []);

  useEffect(() => {
    if (!editingRoleId) {
      setRoleForm((current) => ({
        ...current,
        permissions: buildRolePermissions(menus, current),
      }));
    }
  }, [menus, editingRoleId]);

  const submitRole = async (event) => {
    event.preventDefault();

    try {
      const res = editingRoleId
        ? await updateSuperadminRole(editingRoleId, roleForm)
        : await createSuperadminRole(roleForm);

      toast.success(res?.data?.message || "Role saved");
      resetRoleForm();
      fetchAccessData();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to save role"));
    }
  };

  const editRole = (role) => {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name || "",
      code: role.code || "",
      description: role.description || "",
      status: role.status || "active",
      permissions: buildRolePermissions(menus, role),
    });
  };

  const submitUser = async (event) => {
    event.preventDefault();

    try {
      const payload = { ...userForm };
      if (editingUserId && !payload.password) {
        delete payload.password;
      }

      const res = editingUserId
        ? await updateSuperadminUser(editingUserId, payload)
        : await createSuperadminUser(payload);

      toast.success(res?.data?.message || "User saved");
      resetUserForm();
      fetchAccessData();
    } catch (error) {
      console.error("Error details:", error.response?.data || error);
      toast.error(getApiErrorMessage(error, "Failed to save user"));
    }
  };

  const editUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      roleId: user.roleId || "",
      status: user.status || "active",
    });
  };

  const updatePermission = (menuId, key, value) => {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.map((permission) => {
        if (permission.menuId !== menuId) {
          return permission;
        }

        const next = { ...permission, [key]: value };
        if (key === "canWrite" && value) {
          next.canRead = true;
        }
        if (key === "canRead" && !value) {
          next.canWrite = false;
        }
        return next;
      }),
    }));
  };

  return (
    <SuperadminShell
      accent="cyan"
      eyebrow="Access Control"
      title="Roles and permissions"
      description="Manage superadmin roles, menus, users, and read/write access."
      showHero={false}
    >
      <section className="space-y-6">
        <div className="rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
          <h1 className="text-2xl leading-none tracking-tight font-display">
            Access control
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Manage role based read and write access for superadmin users.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-4 grid grid-cols-12 gap-4">
            <Card className="col-span-12 border-border/70 bg-white/70 lg:col-span-5">
              <CardHeader>
                <CardTitle>{editingRoleId ? "Edit role" : "Add role"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submitRole}>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-6">
                      <Label>Name</Label>
                      <Input
                        value={roleForm.name}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <Label>Code</Label>
                      <Input
                        value={roleForm.code}
                        disabled={roles.find((role) => role.id === editingRoleId)?.isSystem}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            code: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-12">
                      <Label>Description</Label>
                      <Textarea
                        value={roleForm.description}
                        onChange={(event) =>
                          setRoleForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-md border p-3">
                    <p className="text-sm font-semibold">Permissions</p>
                    {roleForm.permissions.map((permission) => (
                      <div
                        key={permission.menuId}
                        className="flex items-center justify-between gap-3 border-b py-2 last:border-0"
                      >
                        <span className="text-sm">{permission.menuTitle}</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            Read
                            <Switch
                              checked={permission.canRead}
                              onCheckedChange={(value) =>
                                updatePermission(permission.menuId, "canRead", value)
                              }
                            />
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            Write
                            <Switch
                              checked={permission.canWrite}
                              onCheckedChange={(value) =>
                                updatePermission(permission.menuId, "canWrite", value)
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    {editingRoleId ? (
                      <Button type="button" variant="outline" onClick={resetRoleForm}>
                        Cancel
                      </Button>
                    ) : null}
                    <Button type="submit">
                      <Plus className="size-4" />
                      Save Role
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-12 border-border/70 bg-white/70 lg:col-span-7">
              <CardHeader>
                <CardTitle>Roles</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableListingSkeleton listingLength={4} columnLength={4} />
                    ) : roles.length ? (
                      roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell>{role.name}</TableCell>
                          <TableCell>{role.code}</TableCell>
                          <TableCell>{role.status}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => editRole(role)}
                              >
                                <PencilLine className="size-4" />
                              </Button>
                              {!role.isSystem ? (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteSuperadminRole(role.id).then(fetchAccessData)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableListingNoRecords span={4} />
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-4 grid grid-cols-12 gap-4">
            <Card className="col-span-12 border-border/70 bg-white/70 lg:col-span-5">
              <CardHeader>
                <CardTitle>{editingUserId ? "Edit user" : "Add user"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submitUser}>
                  <Input
                    placeholder="Name"
                    value={userForm.name}
                    onChange={(event) =>
                      setUserForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={userForm.email}
                    onChange={(event) =>
                      setUserForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder={editingUserId ? "Leave blank to keep password" : "Password"}
                    type="password"
                    value={userForm.password}
                    onChange={(event) =>
                      setUserForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                  />
                  <Select
                    value={userForm.roleId}
                    onValueChange={(value) =>
                      setUserForm((current) => ({ ...current, roleId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {activeRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select
                    value={userForm.status}
                    onValueChange={(value) =>
                      setUserForm((current) => ({ ...current, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    {editingUserId ? (
                      <Button type="button" variant="outline" onClick={resetUserForm}>
                        Cancel
                      </Button>
                    ) : null}
                    <Button type="submit">Save User</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-12 border-border/70 bg-white/70 lg:col-span-7">
              <CardHeader>
                <CardTitle>Superadmin users</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role?.name || "-"}</TableCell>
                        <TableCell>{user.status}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => editUser(user)}
                            >
                              <PencilLine className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteSuperadminUser(user.id).then(fetchAccessData)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </SuperadminShell>
  );
}
