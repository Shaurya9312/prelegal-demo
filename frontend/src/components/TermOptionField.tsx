interface TermOptionFieldProps {
  legend: string;
  name: string;
  fixedSelected: boolean;
  onSelectFixed: () => void;
  years: number;
  onYearsChange: (years: number) => void;
  fixedPrefix?: string;
  fixedSuffix: string;
  otherLabel: string;
  onSelectOther: () => void;
}

export function TermOptionField({
  legend,
  name,
  fixedSelected,
  onSelectFixed,
  years,
  onYearsChange,
  fixedPrefix,
  fixedSuffix,
  otherLabel,
  onSelectOther,
}: TermOptionFieldProps) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <label className="radio-option">
        <input type="radio" name={name} checked={fixedSelected} onChange={onSelectFixed} />
        {fixedPrefix}
        <input
          type="number"
          min={1}
          className="inline-number"
          disabled={!fixedSelected}
          value={years}
          onChange={(event) => onYearsChange(Number(event.target.value))}
        />
        {fixedSuffix}
      </label>
      <label className="radio-option">
        <input type="radio" name={name} checked={!fixedSelected} onChange={onSelectOther} />
        {otherLabel}
      </label>
    </fieldset>
  );
}
