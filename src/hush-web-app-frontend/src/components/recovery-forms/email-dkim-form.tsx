import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function EmailDkimForm({
  output,
  setOutput,
}: {
  output: string;
  setOutput: (newOutput: string) => void;
}) {
  return (
    <div className="grid gap-4 py-4">
      <Badge>DKIM Verifier Selected</Badge>
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message">Your Raw Email</Label>
        <Textarea
          placeholder="Type your message here."
          value={output}
          onChange={(event) => setOutput(event.target.value)}
          id="message"
        />
      </div>
    </div>
  );
}
