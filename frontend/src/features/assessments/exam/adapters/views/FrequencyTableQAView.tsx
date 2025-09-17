import type { QA_Params, QA_Value } from "../types";
import FreqTableQAView from "../../../../../components/student/FreqTableQAView";

type Props = {
  params: QA_Params;
  value: QA_Value;
  onChange: (next: QA_Value) => void;
  statementHtml?: string | null;
  submissionItemId: string;
};

export default function ExamFrequencyTableQAView({
  params,
  value,
  onChange,
  statementHtml,
}: Props) {
  return (
    <>
      {statementHtml && (
        <div
          className="prose prose-sm max-w-none dark:prose-invert mb-3"
          dangerouslySetInnerHTML={{ __html: statementHtml }}
        />
      )}
      <FreqTableQAView params={params} value={value} onChange={onChange} />
    </>
  );
}
