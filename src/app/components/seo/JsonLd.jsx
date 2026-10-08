import React from "react";

function JsonLd({ data }) {
  if (!data || typeof data !== "object") {
    return null;
  }

  try {
    const json = JSON.stringify(data, null, 0);
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: json }}
      />
    );
  } catch (error) {
    return null;
  }
}

export { JsonLd };
export default JsonLd;
