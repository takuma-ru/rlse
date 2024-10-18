import AkarIconsTypescriptFill from "~icons/akar-icons/typescript-fill";
import ClarityCommandLine from "~icons/clarity/command-line";
import MdiCodeJson from "~icons/mdi/code-json";

const langIcon = {
  shell: <ClarityCommandLine />,
  json: <MdiCodeJson />,
  typescript: <AkarIconsTypescriptFill />,
  ts: <AkarIconsTypescriptFill />,
} as const satisfies Record<string, JSX.Element>;

export const LangIcon: React.FC<{ lang: string | undefined }> = ({ lang }) => {
  if (!lang) {
    return null;
  }

  if (lang in langIcon) {
    return langIcon[lang as keyof typeof langIcon];
  }

  return null;
};
