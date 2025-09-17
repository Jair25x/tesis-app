import type { SC_Params, SC_Value } from "../types";
import { SingleChoiceGroup } from "../../../../../components/student/SingleChoiceGroup";

type Props = {
  params: SC_Params;
  value: SC_Value;
  onChange: (next: SC_Value) => void;
  statementHtml?: string | null;
  submissionItemId: string;
};

export default function EquationSingleChoiceView({
  params,
  value,
  onChange,
  statementHtml,
  submissionItemId,
}: Props) {
  return (
    <>
      {statementHtml && (
        <div
          className="prose prose-sm max-w-none dark:prose-invert mb-3"
          dangerouslySetInnerHTML={{ __html: statementHtml }}
        />
      )}
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
        <SingleChoiceGroup
          name={`sc-${submissionItemId}`}
          options={params.choices}
          value={value}
          onChange={onChange}
        />
      </div>
    </>
  );
}
