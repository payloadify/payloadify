"use client";

import { selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import {
  computeCvss31Score,
  computeCvss40Score,
  CvssTemplate,
  CvssVersion,
  PLATFORMS,
  Platform,
  severityRating,
  SeverityRating,
  VULN_CATEGORIES,
  VULN_TYPES,
} from "@payloadify/cvss-core";

const SEVERITY_ORDER: SeverityRating[] = ["Critical", "High", "Medium", "Low", "None"];

function templateSeverity(template: CvssTemplate, version: CvssVersion): SeverityRating {
  const score = version === "3.1" ? computeCvss31Score(template.cvss31).baseScore : computeCvss40Score(template.cvss40).baseScore;
  return severityRating(score);
}

export function PlatformVulnPicker({
  version,
  platformFilter,
  onPlatformChange,
  vulnTypeId,
  onVulnTypeChange,
  templateId,
  onTemplateChange,
  templatesForVulnType,
}: {
  version: CvssVersion;
  platformFilter: Platform;
  onPlatformChange: (p: Platform) => void;
  vulnTypeId: string | null;
  onVulnTypeChange: (id: string | null) => void;
  templateId: string | null;
  onTemplateChange: (id: string | null) => void;
  templatesForVulnType: CvssTemplate[];
}) {
  const vulnTypesForPlatform = VULN_TYPES.filter((v) => v.platforms.includes(platformFilter));
  const vulnTypesByCategory = VULN_CATEGORIES.map((category) => ({
    category,
    types: vulnTypesForPlatform.filter((v) => v.categoryId === category.id).sort((a, b) => a.label.localeCompare(b.label)),
  })).filter((group) => group.types.length > 0);

  const templatesBySeverity = SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    templates: templatesForVulnType.filter((t) => templateSeverity(t, version) === sev),
  })).filter((group) => group.templates.length > 0);

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <div>
        <div className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">Platform</div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={toggleButtonClasses(platformFilter === p.id)}
              onClick={() => onPlatformChange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Vulnerability type</label>
          <select
            className={`${selectClasses} w-full`}
            value={vulnTypeId ?? ""}
            onChange={(e) => onVulnTypeChange(e.target.value === "" ? null : e.target.value)}
          >
            <option value="">Any / Custom</option>
            {vulnTypesByCategory.map(({ category, types }) => (
              <optgroup key={category.id} label={category.label}>
                {types.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Scenario template</label>
          <select
            className={`${selectClasses} w-full`}
            value={templateId ?? ""}
            onChange={(e) => onTemplateChange(e.target.value === "" ? null : e.target.value)}
            disabled={templatesForVulnType.length === 0}
          >
            <option value="">Custom</option>
            {templatesBySeverity.map(({ severity, templates }) => (
              <optgroup key={severity} label={severity}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
