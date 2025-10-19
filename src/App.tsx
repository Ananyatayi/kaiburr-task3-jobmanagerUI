import React, { useEffect, useMemo, useState } from "react";
import {
  Layout,
  Typography,
  Button,
  Table,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Task } from "./types";
import {
  listTasks,
  createTask,
  findTasksByName,
  deleteTask,
  runTask,
} from "./api/tasks";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [form] = Form.useForm();

  const [search, setSearch] = useState<string>("");
  const [searching, setSearching] = useState(false);

  const [runningId, setRunningId] = useState<string | null>(null);
  const [outputModal, setOutputModal] = useState<{ open: boolean; text?: string; started?: string; ended?: string }>({
    open: false,
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const data = await listTasks();
      setTasks(data);
    } catch (e: any) {
      message.error(`Failed to load tasks: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const runSearch = async () => {
    const q = search.trim();
    if (!q) return loadAll();
    try {
      setSearching(true);
      const data = await findTasksByName(q);
      setTasks(data);
    } catch (e: any) {
      // 404 from backend should map to "no tasks found"
      setTasks([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onCreate = async () => {
    try {
      const values = await form.validateFields();
      await createTask({
        name: values.name,
        owner: values.owner,
        command: values.command, // e.g., echo Hello from UI
      });
      message.success("Task created");
      setOpenCreate(false);
      form.resetFields();
      await (search.trim() ? runSearch() : loadAll());
    } catch (e: any) {
      if (e?.errorFields) return; // form validation errors
      message.error(`Create failed: ${e?.message || e}`);
    }
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    Modal.confirm({
      title: "Delete Task?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteTask(id);
          message.success("Task deleted");
          await (search.trim() ? runSearch() : loadAll());
        } catch (e: any) {
          message.error(`Delete failed: ${e?.message || e}`);
        }
      },
    });
  };

  const onRun = async (id?: string, cmd?: string) => {
    if (!id) return;
    // optional UX: warn if command doesn't look like a safe echo
    if (cmd && !/^(\s*echo\s+)/i.test(cmd)) {
      Modal.confirm({
        title: "Run Command?",
        content: (
          <>
            <Paragraph>
              The command does not look like a simple <Text code>echo</Text>.
            </Paragraph>
            <Paragraph>Proceed anyway?</Paragraph>
          </>
        ),
        onOk: () => actuallyRun(id),
      });
    } else {
      actuallyRun(id);
    }
  };

  const actuallyRun = async (id: string) => {
    try {
      setRunningId(id);
      const res = await runTask(id);
      setOutputModal({
        open: true,
        text: res.output,
        started: res.startTime,
        ended: res.endTime,
      });
      message.success("Execution completed");
      // refresh to reflect new execution count
      await (search.trim() ? runSearch() : loadAll());
    } catch (e: any) {
      message.error(`Run failed: ${e?.message || e}`);
    } finally {
      setRunningId(null);
    }
  };

  const columns: ColumnsType<Task> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", width: 260, ellipsis: true },
      { title: "Name", dataIndex: "name" },
      { title: "Owner", dataIndex: "owner", width: 140 },
      { title: "Command", dataIndex: "command", ellipsis: true },
      {
        title: "Executions",
        dataIndex: "taskExecutions",
        align: "center",
        width: 110,
        render: (execs) => (Array.isArray(execs) ? execs.length : 0),
      },
      {
        title: "Actions",
        key: "actions",
        width: 220,
        render: (_, record) => (
          <Space>
            <Tooltip title="Run">
              <Button
                icon={<PlayCircleOutlined />}
                onClick={() => onRun(record.id, record.command)}
                loading={runningId === record.id}
                type="primary"
              >
                Run
              </Button>
            </Tooltip>
            <Tooltip title="View Last Output">
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  const last = record.taskExecutions?.[record.taskExecutions.length - 1];
                  setOutputModal({
                    open: true,
                    text: last?.output || "No executions yet",
                    started: last?.startTime,
                    ended: last?.endTime,
                  });
                }}
              >
                Output
              </Button>
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record.id)}
              >
                Delete
              </Button>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [runningId]
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#001529", padding: "0 24px" }}>
        <Title level={3} style={{ color: "white", margin: 0 }}>
          JobManager UI — Tasks
        </Title>
      </Header>

      <Content style={{ padding: 24 }}>
        {/* Search + Actions */}
        <div style={{ marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Input
            allowClear
            style={{ maxWidth: 360 }}
            prefix={<SearchOutlined />}
            placeholder="Search by name (server-side)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={runSearch}
          />
          <Button onClick={runSearch} loading={searching} icon={<SearchOutlined />}>
            Search
          </Button>
          <Button onClick={loadAll} icon={<ReloadOutlined />}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
            Create
          </Button>
        </div>

        <Table<Task>
          rowKey={(r) => r.id || `${r.name}-${r.owner}`}
          dataSource={tasks}
          columns={columns}
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Content>

      <Footer style={{ textAlign: "center" }}>
        © 2025 JobManager UI | React + TypeScript + Ant Design
      </Footer>

      {/* Create Modal */}
      <Modal
        title="Create Task"
        open={openCreate}
        onOk={onCreate}
        onCancel={() => setOpenCreate(false)}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Cluster Hello" />
          </Form.Item>
          <Form.Item name="owner" label="Owner" rules={[{ required: true }]}>
            <Input placeholder="e.g., AnanyaTayi" />
          </Form.Item>
          <Form.Item
            name="command"
            label="Command"
            tooltip='Use a safe shell command (e.g., echo Hello from UI)'
            rules={[{ required: true }]}
          >
            <Input placeholder='e.g., echo "Hello from UI"' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Output Modal */}
      <Modal
        title="Execution Output"
        open={outputModal.open}
        onCancel={() => setOutputModal({ open: false })}
        footer={<Button onClick={() => setOutputModal({ open: false })}>Close</Button>}
      >
        <Paragraph>
          <Text strong>Start:</Text> {outputModal.started || "-"}
        </Paragraph>
        <Paragraph>
          <Text strong>End:</Text> {outputModal.ended || "-"}
        </Paragraph>
        <Paragraph>
          <Text strong>Output:</Text>
        </Paragraph>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 6,
            maxHeight: 260,
            overflow: "auto",
          }}
        >
{outputModal.text || ""}
        </pre>
      </Modal>
    </Layout>
  );
}
