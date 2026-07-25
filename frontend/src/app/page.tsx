import { MutualNdaForm } from "@/components/MutualNdaForm";

export default function Home() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>Mutual NDA Creator</h1>
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
      <MutualNdaForm />
    </main>
  );
}
