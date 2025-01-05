import React, { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <img
        referrerPolicy="no-referrer-when-downgrade"
        src="https://static.scarf.sh/a.png?x-pxid=d13c8a61-d145-479a-92dc-6a231eddbb3e"
      />
    </>
  );
}
