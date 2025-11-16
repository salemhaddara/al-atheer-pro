"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        [dir="ltr"] [data-slot="switch-thumb"][data-state="unchecked"] {
            transform: translateX(0px) !important;
          }
          [dir="ltr"] [data-slot="switch-thumb"][data-state="checked"] {
            transform: translateX(14px) !important;
          }
          [dir="rtl"] [data-slot="switch-thumb"][data-state="unchecked"] {
            transform: translateX(0px) !important;
          }
          [dir="rtl"] [data-slot="switch-thumb"][data-state="checked"] {
            transform: translateX(-14px) !important;
          }
         
        `
      }} />
      <SwitchPrimitive.Root
        {...props}
        data-slot="switch"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          height: '1.15rem',
          width: '2rem',
          padding: '2px',
          borderRadius: '9999px',
          border: '1px solid transparent',
          transition: 'background-color 200ms',
          outline: 'none',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          opacity: props.disabled ? 0.5 : 1,
        }}
        className={cn(
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background",
          "dark:data-[state=unchecked]:bg-input/80",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          className,
        )}
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={cn(
            "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground",
          )}
          style={{
            display: 'block',
            height: '14px',
            width: '14px',
            borderRadius: '9999px',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            transition: 'transform 200ms ease-in-out',
            pointerEvents: 'none',
          }}
        />
      </SwitchPrimitive.Root>
    </>
  );
}

export { Switch };