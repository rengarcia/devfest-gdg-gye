/** JSON for an inline `<script type="application/json">`: `<` is escaped so no text can close the tag. */
export const jsonForScript = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
