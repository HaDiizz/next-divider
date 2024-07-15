"use client";

import { Modal } from "@mantine/core";
import MemberDataTable from "./MemberDataTable";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getMembers } from "@/actions/memberAction";

const MemberModal = ({ opened, close }) => {
  const params = useParams();
  const { data, isLoading, refetch } = useQuery({
    queryFn: async () => await getMembers(params.id),
    queryKey: ["members", params.id],
  });
  return (
    <>
      <Modal.Root opened={opened} onClose={close} centered>
        <Modal.Overlay backgroundOpacity={0.55} blur={3} />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>รายชื่อสมาชิก</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <MemberDataTable
              members={data?.account?.members || []}
              owner={data?.account?.owner}
              accountId={params.id}
              isLoading={isLoading}
              refetch={refetch}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};

export default MemberModal;
