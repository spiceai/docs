import React, { type PropsWithChildren } from "react";

function ScarfPixel() {
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  return <img
    referrerPolicy="no-referrer-when-downgrade"
    src="https://static.scarf.sh/a.png?x-pxid=d13c8a61-d145-479a-92dc-6a231eddbb3e"
    style={{
      position: "absolute",
    }}
  />;
}

export default function Root({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <ScarfPixel />
    </>
  );
}
