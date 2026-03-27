"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ButtonV2 } from "@/components/ui/v2"
import { Label } from "@/components/ui/label"
import { InputV2 } from "@/components/ui/v2"
import { TextareaV2 } from "@/components/ui/v2"
import { BadgeV2 } from "@/components/ui/v2"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/locales/client"
import { UserSelector } from "./user-selector"
import { EmailPreview } from "./email-preview"
import {
  getUsersList,
  renderEmailPreview,
  sendEmailsToUsers,
  getDefaultTemplateProps,
  getRequiredTemplateProps,
  type EmailTemplate,
} from "../../actions/send-email"
import { Loader2, Send, Users } from "lucide-react"

interface User {
  id: string
  email: string
  firstName: string
  language: string
  createdAt: string
}

interface TemplateOption {
  value: EmailTemplate
  labelKey: string
  descriptionKey: string
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    value: "black-friday",
    labelKey: "admin.sendEmail.templates.blackFriday.label",
    descriptionKey: "admin.sendEmail.templates.blackFriday.description",
  },
  {
    value: "welcome",
    labelKey: "admin.sendEmail.templates.welcome.label",
    descriptionKey: "admin.sendEmail.templates.welcome.description",
  },
  {
    value: "weekly-recap",
    labelKey: "admin.sendEmail.templates.weeklyRecap.label",
    descriptionKey: "admin.sendEmail.templates.weeklyRecap.description",
  },
  {
    value: "new-feature",
    labelKey: "admin.sendEmail.templates.newFeature.label",
    descriptionKey: "admin.sendEmail.templates.newFeature.description",
  },
  {
    value: "renewal-notice",
    labelKey: "admin.sendEmail.templates.renewalNotice.label",
    descriptionKey: "admin.sendEmail.templates.renewalNotice.description",
  },
  {
    value: "team-invitation",
    labelKey: "admin.sendEmail.templates.teamInvitation.label",
    descriptionKey: "admin.sendEmail.templates.teamInvitation.description",
  },
  {
    value: "missing-data",
    labelKey: "admin.sendEmail.templates.missingData.label",
    descriptionKey: "admin.sendEmail.templates.missingData.description",
  },
  {
    value: "support-request",
    labelKey: "admin.sendEmail.templates.supportRequest.label",
    descriptionKey: "admin.sendEmail.templates.supportRequest.description",
  },
  {
    value: "support-subscription-error",
    labelKey: "admin.sendEmail.templates.supportSubscriptionError.label",
    descriptionKey: "admin.sendEmail.templates.supportSubscriptionError.description",
  },
]

function formatMessage(key: string, t: ReturnType<typeof useI18n>, params?: Record<string, string | number>) {
  const message = t(key as never)
  if (!params) return message
  return Object.entries(params).reduce(
    (acc, [paramKey, value]) => acc.replace(new RegExp(`{${paramKey}}`, "g"), String(value)),
    message
  )
}

function getMissingTemplateProps(requiredProps: string[], customProps: Record<string, unknown>) {
  return requiredProps.filter((prop) => {
    const value = customProps[prop]
    return value === undefined || value === null || value === ""
  })
}

function getSendValidationError({
  selectedTemplate,
  selectedUsers,
  missingProps,
  t,
  format,
}: {
  selectedTemplate: EmailTemplate | null
  selectedUsers: string[]
  missingProps: string[]
  t: ReturnType<typeof useI18n>
  format: (key: string, params?: Record<string, string | number>) => string
}) {
  if (!selectedTemplate) {
    return t("admin.sendEmail.actions.validation.template")
  }

  if (selectedUsers.length === 0) {
    return t("admin.sendEmail.actions.validation.recipients")
  }

  if (missingProps.length > 0) {
    return format("admin.sendEmail.actions.validation.missingProps", { props: missingProps.join(", ") })
  }

  return null
}

function TemplateSelectionCard({
  selectedTemplate,
  onTemplateSelect,
  format,
}: {
  selectedTemplate: EmailTemplate | null
  onTemplateSelect: (template: EmailTemplate) => void
  format: (key: string, params?: Record<string, string | number>) => string
}) {
  const t = useI18n()
  const selectedTemplateMeta = TEMPLATE_OPTIONS.find((option) => option.value === selectedTemplate)

  return (
    <div className="lg:col-span-2 space-y-2">
      <Label htmlFor="template" className="text-sm font-medium">
        {t("admin.sendEmail.template.selectLabel")}
      </Label>
      <Select
        value={selectedTemplate ?? undefined}
        onValueChange={(value) => onTemplateSelect(value as EmailTemplate)}
      >
        <SelectTrigger id="template" className="w-full max-w-xl">
          <SelectValue placeholder={t("admin.sendEmail.template.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          {TEMPLATE_OPTIONS.map((template) => (
            <SelectItem key={template.value} value={template.value}>
              {format(template.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedTemplateMeta ? (
        <p className="text-xs text-muted-foreground">{format(selectedTemplateMeta.descriptionKey)}</p>
      ) : (
        <p className="text-xs text-muted-foreground">{t("admin.sendEmail.template.helper")}</p>
      )}
    </div>
  )
}

function BooleanPropField({
  propKey,
  value,
  onChange,
}: {
  propKey: string
  value: boolean
  onChange: (key: string, value: unknown) => void
}) {
  const t = useI18n()

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={propKey}
        checked={value}
        onChange={(event) => onChange(propKey, event.target.checked)}
        className="rounded"
      />
      <Label htmlFor={propKey} className="font-normal">
        {value ? t("admin.sendEmail.props.boolean.enabled") : t("admin.sendEmail.props.boolean.disabled")}
      </Label>
    </div>
  )
}

function StringArrayPropField({
  propKey,
  value,
  onChange,
}: {
  propKey: string
  value: string[]
  onChange: (key: string, value: unknown) => void
}) {
  const t = useI18n()

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={`${propKey}-${index}`} className="flex gap-2">
          <InputV2
            value={item}
            onChange={(event) => {
              const next = [...value]
              next[index] = event.target.value
              onChange(propKey, next)
            }}
          />
          <ButtonV2 
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(propKey, value.filter((_, itemIndex) => itemIndex !== index))}
          >
            {t("admin.sendEmail.props.array.remove")}
          </ButtonV2>
        </div>
      ))}
      <ButtonV2 
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange(propKey, [...value, ""])}
      >
        {t("admin.sendEmail.props.array.add")}
      </ButtonV2>
    </div>
  )
}

function LocalePropField({
  propKey,
  value,
  onChange,
}: {
  propKey: string
  value: string
  onChange: (key: string, value: unknown) => void
}) {
  const t = useI18n()

  return (
    <div className="flex flex-col gap-2">
      <Tabs
        value={value}
        onValueChange={(newValue) => onChange(propKey, newValue)}
        className="w-fit"
      >
        <TabsList>
          <TabsTrigger value="en">{t("admin.sendEmail.props.language.english")}</TabsTrigger>
          <TabsTrigger value="fr">{t("admin.sendEmail.props.language.french")}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

function NumberPropField({
  propKey,
  value,
  onChange,
}: {
  propKey: string
  value: number
  onChange: (key: string, value: unknown) => void
}) {
  return (
    <InputV2
      type="number"
      id={propKey}
      value={String(value)}
      onChange={(event) => onChange(propKey, Number(event.target.value))}
    />
  )
}

function JsonPropField({
  propKey,
  value,
  onChange,
}: {
  propKey: string
  value: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}) {
  const stringValue = JSON.stringify(value, null, 2)

  return (
    <TextareaV2
      id={propKey}
      value={stringValue}
      onChange={(event) => {
        try {
          onChange(propKey, JSON.parse(event.target.value))
        } catch {
          onChange(propKey, event.target.value)
        }
      }}
      rows={4}
    />
  )
}

function TextPropField({
  propKey,
  value,
  onChange,
}: {
  propKey: string
  value: string | number | boolean | null | undefined
  onChange: (key: string, value: unknown) => void
}) {
  return (
    <InputV2
      id={propKey}
      value={value === undefined || value === null ? "" : String(value)}
      onChange={(event) => onChange(propKey, event.target.value)}
    />
  )
}

function TemplatePropField({
  propKey,
  value,
  onChange,
}: {
  propKey: string
  value: unknown
  onChange: (key: string, value: unknown) => void
}) {
  if (typeof value === "boolean") {
    return <BooleanPropField propKey={propKey} value={value} onChange={onChange} />
  }

  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return <StringArrayPropField propKey={propKey} value={value} onChange={onChange} />
  }

  if (typeof value === "number") {
    return <NumberPropField propKey={propKey} value={value} onChange={onChange} />
  }

  if (typeof value === "string" && (propKey === "locale" || propKey === "language")) {
    return <LocalePropField propKey={propKey} value={value} onChange={onChange} />
  }

  if (typeof value === "object" && value !== null) {
    return <JsonPropField propKey={propKey} value={value as Record<string, unknown>} onChange={onChange} />
  }

  return <TextPropField propKey={propKey} value={value as string | number | boolean | null | undefined} onChange={onChange} />
}

function TemplatePropsCard({
  selectedTemplate,
  customProps,
  requiredProps,
  customSubject,
  onSubjectChange,
  onPropChange,
}: {
  selectedTemplate: EmailTemplate | null
  customProps: Record<string, unknown>
  requiredProps: string[]
  customSubject: string
  onSubjectChange: (value: string) => void
  onPropChange: (key: string, value: unknown) => void
}) {
  const t = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.sendEmail.props.title")}</CardTitle>
        <CardDescription>{t("admin.sendEmail.props.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">{t("admin.sendEmail.subject.label")}</Label>
          <InputV2
            id="subject"
            placeholder={t("admin.sendEmail.subject.placeholder")}
            value={customSubject}
            onChange={(event) => onSubjectChange(event.target.value)}
            disabled={!selectedTemplate}
          />
        </div>

        <ScrollArea className="max-h-[420px] pr-4">
          <div className="space-y-4">
            {selectedTemplate ? (
              Object.entries(customProps).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={key} className="capitalize">
                      {key}
                    </Label>
                    {requiredProps.includes(key) && (
                      <BadgeV2 variant="outline" className="text-xs">
                        {t("admin.sendEmail.props.requiredBadge")}
                      </BadgeV2>
                    )}
                  </div>
                  <TemplatePropField propKey={key} value={value} onChange={onPropChange} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t("admin.sendEmail.props.placeholder")}</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function RecipientsCard({
  users,
  selectedUsers,
  loadingUsers,
  onSelectionChange,
}: {
  users: User[]
  selectedUsers: string[]
  loadingUsers: boolean
  onSelectionChange: (value: string[]) => void
}) {
  const t = useI18n()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.sendEmail.recipients.title")}</CardTitle>
        <CardDescription>{t("admin.sendEmail.recipients.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <UserSelector users={users} selectedUsers={selectedUsers} onSelectionChange={onSelectionChange} />
        )}
      </CardContent>
    </Card>
  )
}

function PreviewCard({
  previewHtml,
  loadingPreview,
  previewDevice,
  onPreviewDeviceChange,
}: {
  previewHtml: string | null
  loadingPreview: boolean
  previewDevice: "desktop" | "mobile"
  onPreviewDeviceChange: (device: "desktop" | "mobile") => void
}) {
  const t = useI18n()

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{t("admin.sendEmail.preview.title")}</CardTitle>
            <CardDescription>{t("admin.sendEmail.preview.description")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("admin.sendEmail.preview.device.label")}
            </span>
            <div className="inline-flex rounded-md border bg-muted/50 p-1 text-sm">
              <ButtonV2 
                type="button"
                variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onPreviewDeviceChange("desktop")}
              >
                {t("admin.sendEmail.preview.device.desktop")}
              </ButtonV2>
              <ButtonV2 
                type="button"
                variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onPreviewDeviceChange("mobile")}
              >
                {t("admin.sendEmail.preview.device.mobile")}
              </ButtonV2>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 gap-4 flex flex-col">
        {loadingPreview ? (
          <div className="flex h-full items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">{t("admin.sendEmail.preview.loading")}</span>
          </div>
        ) : previewHtml ? (
          <div
            className="mx-auto w-full flex-1"
            style={{
              maxWidth: previewDevice === "mobile" ? "430px" : "1200px",
            }}
          >
            <EmailPreview
              html={previewHtml}
              height={previewDevice === "mobile" ? "900px" : "750px"}
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center text-muted-foreground">
            {t("admin.sendEmail.preview.empty")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SendEmailPageClient() {
  const t = useI18n()
  const format = useCallback(
    (key: string, params?: Record<string, string | number>) => formatMessage(key, t, params),
    [t]
  )
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [customProps, setCustomProps] = useState<Record<string, unknown>>({})
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [customSubject, setCustomSubject] = useState("")
  const [requiredProps, setRequiredProps] = useState<string[]>([])
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true)
      try {
        const list = await getUsersList()
        setUsers(list)
      } catch (error) {
        console.error("Failed to load users:", error)
        toast.error(t("admin.sendEmail.toast.loadUsersError"))
      } finally {
        setLoadingUsers(false)
      }
    }

    loadUsers()
  }, [t])

  useEffect(() => {
    const loadRequiredProps = async () => {
      if (!selectedTemplate) {
        setRequiredProps([])
        return
      }
      const props = await getRequiredTemplateProps(selectedTemplate)
      setRequiredProps(props)
    }

    loadRequiredProps()
  }, [selectedTemplate])

  const updatePreview = useCallback(async () => {
    if (!selectedTemplate) {
      setPreviewHtml(null)
      return
    }

    setLoadingPreview(true)
    try {
      const defaultProps = await getDefaultTemplateProps(selectedTemplate)
      const mergedProps = { ...defaultProps, ...customProps }
      const result = await renderEmailPreview(selectedTemplate, mergedProps)

      if (result.success && result.html) {
        setPreviewHtml(result.html)
      } else {
        toast.error(result.error || t("admin.sendEmail.toast.previewError"))
      }
    } catch (error) {
      console.error("Failed to update preview:", error)
      toast.error(t("admin.sendEmail.toast.previewError"))
    } finally {
      setLoadingPreview(false)
    }
  }, [selectedTemplate, customProps, t])

  useEffect(() => {
    updatePreview()
  }, [updatePreview])

  const handleTemplateSelect = async (template: EmailTemplate) => {
    setSelectedTemplate(template)
    const defaults = await getDefaultTemplateProps(template)
    setCustomProps(defaults)
  }

  const handlePropChange = (key: string, value: unknown) => {
    setCustomProps((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSend = async () => {
    const missingProps = getMissingTemplateProps(requiredProps, customProps)
    const template = selectedTemplate

    const validationError = getSendValidationError({
      selectedTemplate: template,
      selectedUsers,
      missingProps,
      t,
      format,
    })

    if (validationError) {
      toast.error(validationError)
      return
    }

    if (!template) {
      toast.error(t("admin.sendEmail.actions.validation.template"))
      return
    }

    setSending(true)
    try {
      const result = await sendEmailsToUsers(template, selectedUsers, customProps, customSubject || undefined)

      if (result.error) {
        toast.error(result.error || t("admin.sendEmail.toast.sendError"))
        return
      }

      const successCount = result.successCount ?? 0
      const errorCount = result.errorCount ?? 0
      toast.success(
        errorCount > 0
          ? format("admin.sendEmail.toast.sendPartialSuccess", { successCount, errorCount })
          : format("admin.sendEmail.toast.sendSuccess", { successCount })
      )
      setSelectedUsers([])
      setCustomSubject("")
    } catch (error) {
      console.error("Failed to send emails:", error)
      toast.error(t("admin.sendEmail.toast.sendError"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <TemplateSelectionCard
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            format={format}
          />
          <TemplatePropsCard
            selectedTemplate={selectedTemplate}
            customProps={customProps}
            requiredProps={requiredProps}
            customSubject={customSubject}
            onSubjectChange={setCustomSubject}
            onPropChange={handlePropChange}
          />
          <RecipientsCard
            users={users}
            selectedUsers={selectedUsers}
            loadingUsers={loadingUsers}
            onSelectionChange={setSelectedUsers}
          />
        </div>
        <PreviewCard
          previewHtml={previewHtml}
          loadingPreview={loadingPreview}
          previewDevice={previewDevice}
          onPreviewDeviceChange={setPreviewDevice}
        />
      </div>
      <div className="border-t pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{format("admin.sendEmail.recipients.selected", { count: selectedUsers.length })}</span>
          </div>
          <ButtonV2  size="lg" onClick={handleSend} disabled={!selectedTemplate || selectedUsers.length === 0 || sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("admin.sendEmail.actions.sending")}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {format("admin.sendEmail.actions.send", { count: selectedUsers.length })}
              </>
            )}
          </ButtonV2>
        </div>
      </div>
    </div>
  )
}
