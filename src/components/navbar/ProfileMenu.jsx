import { forwardRef } from "react";
import { ChevronDownIcon, ExitIcon } from "@radix-ui/react-icons";
import { Group, Avatar, Text, Menu, UnstyledButton } from "@mantine/core";
import { signOut } from "next-auth/react";
import ChartMixedDollar from "../icons/ChartMixedDollar";
import Link from "next/link";
import { nprogress } from "@mantine/nprogress";

// eslint-disable-next-line react/display-name
const UserButton = forwardRef(({ username, icon, ...others }, ref) => (
  <UnstyledButton ref={ref} {...others}>
    <Group>
      <Avatar size="2rem" name={username} color="initials" radius="md" />
      <div style={{ flex: 1 }}>
        <Text size="sm" fw={500}>
          {username}
        </Text>
      </div>

      {icon || <ChevronDownIcon className="w-5 h-5 text-primary" />}
    </Group>
  </UnstyledButton>
));

export default function ProfileMenu({ session }) {
  return (
    <>
      <Menu withArrow>
        <Menu.Target>
          <UserButton username={session?.user?.username} />
        </Menu.Target>
        <Menu.Dropdown>
          <Link className="w-full h-full" href="/investment">
            <Menu.Item
              onClick={() => {
                nprogress.start();
              }}
              leftSection={<ChartMixedDollar className="w-4 h-4" />}
            >
              investment
            </Menu.Item>
          </Link>
          <Menu.Item
            onClick={async () => {
              await signOut({ callbackUrl: "/sign-in" });
            }}
            color="red"
            leftSection={<ExitIcon className="w-4 h-4" />}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
