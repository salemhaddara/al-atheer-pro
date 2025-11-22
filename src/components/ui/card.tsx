'use client';
import * as React from "react";

import { cn } from "./utils";
import { useLanguage } from "../../contexts/LanguageContext";

type Direction = 'rtl' | 'ltr';

interface CardProps extends React.ComponentProps<"div"> {
  dir?: Direction;
}

function Card({ className, dir, ...props }: CardProps) {
  const context = useLanguage();
  const direction = dir ?? context.direction;

  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        direction,
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps extends React.ComponentProps<"div"> {
  dir?: Direction;
}

function CardHeader({ className, dir, ...props }: CardHeaderProps) {
  const context = useLanguage();
  const direction = dir ?? context.direction;

  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        direction,
        className,
      )}
      {...props}
    />
  );
}

interface CardTitleProps extends React.ComponentProps<"div"> {
  dir?: Direction;
}

function CardTitle({ className, dir, ...props }: CardTitleProps) {
  const context = useLanguage();
  const direction = dir ?? context.direction;

  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", direction === 'rtl' ? 'text-right' : 'text-left', className)}
      {...props}
    />
  );
}

interface CardDescriptionProps extends React.ComponentProps<"div"> {
  dir?: Direction;
}

function CardDescription({ className, dir, ...props }: CardDescriptionProps) {
  const context = useLanguage();
  const direction = dir ?? context.direction;

  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", direction === 'rtl' ? 'text-right' : 'text-left', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

interface CardContentProps extends React.ComponentProps<"div"> {
  dir?: Direction;
}

function CardContent({ className, dir, ...props }: CardContentProps) {
  const context = useLanguage();
  const direction = dir ?? context.direction;

  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-6 [&:last-child]:pb-6",
        direction === 'rtl' ? 'text-right' : 'text-left',
        className
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
