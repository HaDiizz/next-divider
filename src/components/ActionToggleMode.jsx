"use client";
import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

const ActionToggleMode = () => {
  const { setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const computedColorScheme = useComputedColorScheme("dark");

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <ActionIcon
        onClick={() =>
          setColorScheme(computedColorScheme === "light" ? "dark" : "light")
        }
        variant="light"
        size="xl"
        radius="md"
        aria-label="Toggle color scheme"
      >
        <SunIcon
          className={`${
            computedColorScheme === "dark" ? "block" : "hidden"
          } w-[18px] h-[18px]`}
          stroke={1.5}
        />
        <MoonIcon
          className={`${
            computedColorScheme === "dark" ? "hidden" : "block"
          } w-[18px] h-[18px]`}
          stroke={1.5}
        />
      </ActionIcon>
    </div>
  );
};

export default ActionToggleMode;
