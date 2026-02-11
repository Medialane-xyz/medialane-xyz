export const handleNewTagChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setFieldValue: any
) => {
  setFieldValue("newTag", e.target.value);
};

export const handleNewTagKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  values: any,
  setFieldValue: any,
  quickTags: string[]
) => {
  if (e.key === "Enter") {
    e.preventDefault();
    tryAddTag(values, setFieldValue, quickTags);
  }
};

export const tryAddTag = (
  values: any,
  setFieldValue: any,
  quickTags: string[]
) => {
  const tag = values.newTag.trim().toLowerCase();
  if (tag && !values.tags.includes(tag) && !quickTags.includes(tag)) {
    setFieldValue("tags", [...values.tags, tag]);
    setFieldValue("newTag", "");
  }
};
