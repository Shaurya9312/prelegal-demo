"use client";

import { useRef } from "react";
import { MutualNdaForm, type MutualNdaFormHandle } from "@/components/MutualNdaForm";

export default function Home() {
  const formHandleRef = useRef<MutualNdaFormHandle>(null);

  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header-top">
          <h1>Mutual NDA Creator</h1>
          <div className="page-header-actions">
            <button type="button" onClick={() => formHandleRef.current?.downloadPdf()}>
              Download Mutual NDA (.pdf)
            </button>
          </div>
        </div>
        <p>
          Fill in the details below to generate a Common Paper Mutual
          Non-Disclosure Agreement, then download the completed document.
        </p>
        <p className="disclaimer">
          This is a prototype for informational purposes only and does not
          constitute legal advice. The underlying template is licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>{" "}
          courtesy of{" "}
          <a href="https://commonpaper.com" target="_blank" rel="noreferrer">
            Common Paper
          </a>
          .
        </p>
      </header>
      <MutualNdaForm ref={formHandleRef} />
    </main>
  );
}
