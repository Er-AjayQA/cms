"use client";

import { useSubscriptionPlans } from "@/app/context/superadmin_contexts/subscriptionPlanContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatAmount } from "@/lib/utils";

export const SubscriptionForm = () => {
  const { formik, mode, handleCloseForm, billingCycleOptions } =
    useSubscriptionPlans();

  const isDisable = mode === "view" ? true : false;
  const handlePriceBlur = (event) => {
    formik.handleBlur(event);
    formik.setFieldValue("price", formatAmount(event.target.value));
  };

  const formTitle = {
    view: "View Plan",
    edit: "Edit Plan",
    create: "Add Plan",
  };

  const formDescription = {
    view: "View plan details.",
    edit: "Update plan details and save changes.",
    create: "Create a new subscription plan.",
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[10px] border border-white/60 bg-white/60 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
        <div>
          <h1 className="text-2xl leading-none tracking-tight font-display">
            {formTitle[mode]}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {formDescription[mode]}
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={formik.handleSubmit}>
        {/* Basic Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Basic info</CardTitle>
            <CardDescription>Basic plan details.</CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  type="text"
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Plan name"
                  value={formik.values.name}
                  error={formik.errors.name}
                  disabled={isDisable}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  type="text"
                  name="code"
                  onBlur={(e) => {
                    const upperValue = e.target.value.toUpperCase();
                    formik.setFieldValue("code", upperValue);
                    formik.handleBlur(e);
                  }}
                  onChange={formik.handleChange}
                  placeholder="Plan code"
                  value={formik.values.code}
                  error={formik.errors.code}
                  disabled={isDisable}
                />
                {formik.touched.code && formik.errors.code && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.code}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing & Payment Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Billing & Payment</CardTitle>
            <CardDescription>
              Provide the billing & payment details.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  type="number"
                  name="price"
                  onBlur={handlePriceBlur}
                  onChange={formik.handleChange}
                  placeholder="0.00"
                  value={formik.values.price}
                  error={formik.errors.price}
                  disabled={isDisable}
                  inputMode="decimal"
                />
                {formik.touched.price && formik.errors.price && (
                  <p className="mt-1 text-xs text-red-600 ms-2">
                    {formik.errors.price}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <Select
                  name="billing_cycle"
                  value={formik.values.billing_cycle}
                  onValueChange={(value) =>
                    formik.setFieldValue("billing_cycle", value)
                  }
                  disabled={isDisable}
                >
                  <SelectTrigger
                    className="w-full"
                    onBlur={() => formik.setFieldTouched("billing_cycle", true)}
                  >
                    <SelectValue placeholder="Select a billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {billingCycleOptions.map((option, idx) => {
                        return (
                          <SelectItem key={idx} value={option.value}>
                            {option.label}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restrictions Info */}
        <Card className="overflow-hidden border-border/70 bg-white/70">
          <CardHeader className="py-2">
            <CardTitle className="text-md">Restrictions</CardTitle>
            <CardDescription>Provide limit and restrictions.</CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Input
                  type="number"
                  name="max_pages"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Max pages"
                  value={formik.values.max_pages}
                  disabled={isDisable}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  type="number"
                  name="max_users"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Max users"
                  value={formik.values.max_users}
                  disabled={isDisable}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  type="number"
                  name="max_storage_gb"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Max storage"
                  value={formik.values.max_storage_gb}
                  disabled={isDisable}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <Input
                  type="number"
                  name="trial_days"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Trial days"
                  value={formik.values.trial_days}
                  disabled={isDisable}
                />
              </div>

              <div className="col-span-12">
                <Textarea
                  name="description"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  placeholder="Description"
                  value={formik.values.description}
                  disabled={isDisable}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={handleCloseForm} type="button" variant="outline">
            Back to Listing
          </Button>
          {mode !== "view" && (
            <Button type="submit">
              {mode === "edit" ? "Update Plan" : "Create Plan"}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};
