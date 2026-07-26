import type { PartyDetails } from "@/lib/mutual-nda";

interface PartyFieldsProps {
  legend: string;
  idPrefix: string;
  value: PartyDetails;
  onChange: (value: PartyDetails) => void;
}

export function PartyFields({ legend, idPrefix, value, onChange }: PartyFieldsProps) {
  const update = (field: keyof PartyDetails) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [field]: event.target.value });
  };

  return (
    <fieldset className="party-fields">
      <legend>{legend}</legend>

      <label htmlFor={`${idPrefix}-companyName`}>Company</label>
      <input
        id={`${idPrefix}-companyName`}
        type="text"
        required
        value={value.companyName}
        onChange={update("companyName")}
      />

      <label htmlFor={`${idPrefix}-printName`}>Print Name</label>
      <input
        id={`${idPrefix}-printName`}
        type="text"
        required
        value={value.printName}
        onChange={update("printName")}
      />

      <label htmlFor={`${idPrefix}-title`}>Title</label>
      <input
        id={`${idPrefix}-title`}
        type="text"
        required
        value={value.title}
        onChange={update("title")}
      />

      <label htmlFor={`${idPrefix}-noticeAddress`}>Notice Address (email or postal)</label>
      <input
        id={`${idPrefix}-noticeAddress`}
        type="text"
        required
        value={value.noticeAddress}
        onChange={update("noticeAddress")}
      />
    </fieldset>
  );
}
