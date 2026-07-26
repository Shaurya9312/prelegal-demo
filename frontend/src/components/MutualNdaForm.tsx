"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  buildMutualNda,
  createDefaultFormValues,
  getTodayIsoDate,
  type MutualNdaFormValues,
} from "@/lib/mutual-nda";
import { downloadMutualNdaPdf } from "@/lib/pdf";
import { PartyFields } from "@/components/PartyFields";
import { TermOptionField } from "@/components/TermOptionField";

export type MutualNdaFormHandle = {
  downloadPdf: () => void;
};

export const MutualNdaForm = forwardRef<MutualNdaFormHandle>(function MutualNdaForm(_props, ref) {
  const [values, setValues] = useState<MutualNdaFormValues>(() =>
    createDefaultFormValues(getTodayIsoDate()),
  );
  const formRef = useRef<HTMLFormElement>(null);

  const preview = useMemo(() => buildMutualNda(values), [values]);

  const update = <K extends keyof MutualNdaFormValues>(field: K, value: MutualNdaFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleDownloadPdf = () => {
    if (!formRef.current?.reportValidity()) {
      return;
    }
    downloadMutualNdaPdf(values);
  };

  useImperativeHandle(ref, () => ({ downloadPdf: handleDownloadPdf }));

  return (
    <div className="nda-layout">
      <form ref={formRef} className="nda-form" onSubmit={(event) => event.preventDefault()}>
        <fieldset>
          <legend>Purpose</legend>
          <label htmlFor="purpose">How Confidential Information may be used</label>
          <textarea
            id="purpose"
            required
            rows={3}
            value={values.purpose}
            onChange={(event) => update("purpose", event.target.value)}
          />
        </fieldset>

        <fieldset>
          <legend>Effective Date</legend>
          <label htmlFor="effectiveDate">Effective Date</label>
          <input
            id="effectiveDate"
            type="date"
            required
            value={values.effectiveDate}
            onChange={(event) => update("effectiveDate", event.target.value)}
          />
        </fieldset>

        <TermOptionField
          legend="MNDA Term"
          name="mndaTermOption"
          fixedSelected={values.mndaTermOption === "fixed"}
          onSelectFixed={() => update("mndaTermOption", "fixed")}
          years={values.mndaTermYears}
          onYearsChange={(years) => update("mndaTermYears", years)}
          fixedPrefix="Expires"
          fixedSuffix="year(s) from Effective Date"
          otherLabel="Continues until terminated in accordance with the terms of the MNDA"
          onSelectOther={() => update("mndaTermOption", "until-terminated")}
        />

        <TermOptionField
          legend="Term of Confidentiality"
          name="confidentialityTermOption"
          fixedSelected={values.confidentialityTermOption === "fixed"}
          onSelectFixed={() => update("confidentialityTermOption", "fixed")}
          years={values.confidentialityTermYears}
          onYearsChange={(years) => update("confidentialityTermYears", years)}
          fixedSuffix="year(s) from Effective Date (trade secrets protected until no longer a trade secret)"
          otherLabel="In perpetuity"
          onSelectOther={() => update("confidentialityTermOption", "perpetuity")}
        />

        <fieldset>
          <legend>Governing Law &amp; Jurisdiction</legend>
          <label htmlFor="governingLaw">Governing Law (state)</label>
          <input
            id="governingLaw"
            type="text"
            required
            placeholder="e.g. Delaware"
            value={values.governingLaw}
            onChange={(event) => update("governingLaw", event.target.value)}
          />
          <label htmlFor="jurisdiction">Jurisdiction</label>
          <input
            id="jurisdiction"
            type="text"
            required
            placeholder="e.g. courts located in New Castle, DE"
            value={values.jurisdiction}
            onChange={(event) => update("jurisdiction", event.target.value)}
          />
        </fieldset>

        <PartyFields
          legend="Party 1"
          idPrefix="party-one"
          value={values.partyOne}
          onChange={(value) => update("partyOne", value)}
        />
        <PartyFields
          legend="Party 2"
          idPrefix="party-two"
          value={values.partyTwo}
          onChange={(value) => update("partyTwo", value)}
        />

        <div className="form-actions">
          <button type="button" onClick={handleDownloadPdf}>
            Download Mutual NDA (.pdf)
          </button>
        </div>
      </form>

      <section className="nda-preview" aria-label="Document preview">
        <h2>Preview</h2>
        <pre>{preview}</pre>
      </section>
    </div>
  );
});
