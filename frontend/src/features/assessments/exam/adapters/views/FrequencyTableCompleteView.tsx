import type { FC_Params, FC_Value } from "../types";
import FreqTableCompleteInlineCells from "../../../../../components/student/FreqTableCompleteInlineCells";

type Props = {
  params: FC_Params;
  value: FC_Value;
  onChange: (next: FC_Value) => void;
  statementHtml?: string | null;
  submissionItemId: string;
};

export default function ExamFrequencyTableCompleteView({
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
      <FreqTableCompleteInlineCells
        params={params}
        value={value}
        onChange={onChange}
      />
    </>
  );
}
