import React from "react";

function JsonLd({ data }) {
  if (!data || typeof data !== "object") {
    return null;
  }

  /*
   * Only the serialization lives inside try/catch. JSON.stringify can
   * throw on circular references or BigInt. Constructing the <script> JSX
   * happens after the try block, so no JSX is built inside try/catch
   * (react-hooks/error-boundaries) — React defers rendering anyway, so a
   * try/catch around JSX would never catch a real render error.
   */
  let json;

  try {
    json = JSON.stringify(data, null, 0);
  } catch {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export { JsonLd };
export default JsonLd;
