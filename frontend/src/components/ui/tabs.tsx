import * as React from "react";
import { Tabs as TabsBase } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

import styles from "./tabs.module.css";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsBase.Root.Props) {
  return (
    <TabsBase.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(styles.tabs, className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(styles.list, {
  variants: {
    variant: {
      default: styles.listDefault,
      line: styles.listLine,
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsBase.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsBase.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends TabsBase.Tab.Props {
  icon?: React.ReactNode;
}

function TabsTrigger({
  className,
  icon,
  children,
  ...props
}: TabsTriggerProps) {
  return (
    <TabsBase.Tab
      data-slot="tabs-trigger"
      className={cn(styles.trigger, className)}
      {...props}
    >
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      <span className="font-button">{children}</span>
    </TabsBase.Tab>
  );
}

function TabsContent({ className, ...props }: TabsBase.Panel.Props) {
  return (
    <TabsBase.Panel
      data-slot="tabs-content"
      className={cn(styles.content, className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
