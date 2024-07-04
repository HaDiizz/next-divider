import { forwardRef } from "react";
import { ChevronDownIcon, ExitIcon } from "@radix-ui/react-icons";
import { Group, Avatar, Text, Menu, UnstyledButton } from "@mantine/core";
import { signOut } from "next-auth/react";

// eslint-disable-next-line react/display-name
const UserButton = forwardRef(({ image, username, icon, ...others }, ref) => (
  <UnstyledButton ref={ref} {...others}>
    <Group>
      <Avatar size="2rem" src={image} radius="md" />
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
          <UserButton
            image={`https://ui-avatars.com/api/?name=${session?.user?.username}&&background=729af2&color=fff`}
            username={session?.user?.username}
          />
        </Menu.Target>
        <Menu.Dropdown>
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
