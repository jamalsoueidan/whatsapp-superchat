import {
  ActionIcon,
  Box,
  BoxProps,
  Divider,
  Group,
  Title,
} from "@mantine/core";
import { IconVectorBezierCircle } from "@tabler/icons-react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { useLocation, useParams } from "wouter";

export function NodeWrapper({
  children,
  bg,
  withTarget = true,
  ...props
}: NodeProps &
  Pick<BoxProps, "bg"> & { children: React.ReactNode; withTarget?: boolean }) {
  const [, setLocation] = useLocation();
  const params = useParams<{ flowId: string; id: string }>();

  return (
    <>
      <Box
        bg={bg || "white"}
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          ...(params.id === props.id
            ? { outline: "2px solid var(--mantine-color-blue-6)" }
            : {}),
        }}
        miw="200px"
        maw="300px"
      >
        <Group
          gap="xs"
          p="xs"
          justify="space-between"
          align="center"
          pos="relative"
        >
          <Title order={4}>{capitalizeFirstLetter(props.type!)}</Title>
          <ActionIcon
            variant="transparent"
            color="black"
            onClick={() =>
              setLocation(`/${params.flowId}/controls/${props.id}`)
            }
          >
            <IconVectorBezierCircle
              color={
                params.id === props.id ? "var(--mantine-color-blue-6)" : "black"
              }
            />
          </ActionIcon>
          {withTarget ? (
            <Handle
              type="target"
              position={props.targetPosition || Position.Top}
              id={props.id}
            />
          ) : null}
        </Group>
        <Divider />
        {children}
      </Box>
    </>
  );
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
