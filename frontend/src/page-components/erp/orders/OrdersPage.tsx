import { useId, useState } from "react"

import template from "../../../models/order.model.json"
import * as XLSX from "xlsx"
import EditableTable from "../../../components/editable/EditableTable"
import TableType from "../../../types/TableType"
import ApiEntryEditable from "../../../components/api/ApiEntryEditable"
import Workspace from "../../../components/layout/Workspace"
import OrdersList from "./OrdersList"
import _ from "lodash"
import { useRouter } from "next/router"
import { createEmptyMatrix } from "react-spreadsheet"
import { NextPage } from "next"
import { getQueryAsIntOrNull } from "../../../utils/nextQueryUtils"
import { Button, Modal, SimpleGrid, Stack, Text } from "@mantine/core"
import { CirclePlus, Mail } from "tabler-icons-react"

const OrdersPage: NextPage = () => {
  const uuid = useId()
  const [openAddModal, setOpenAddModal] = useState(false)
  const [sheets, setSheets] = useState<TableType[]>([
    {
      name: "Arkusz 1",
      data: createEmptyMatrix(2, 2),
    },
    {
      name: "Arkusz 2",
      data: createEmptyMatrix(2, 2),
    },
  ])
  const router = useRouter()
  const id = getQueryAsIntOrNull(router, "id")
  const currentView = id ? 1 : 0
  const childrenLabels = ["Lista zamówień", "Właściwości"].concat(
    sheets.map((val) => val.name)
  )
  return (
    <>
      <Workspace
        childrenWrapperProps={[
          undefined,
          { style: { flexGrow: 1 } },
          { style: { flexGrow: 1 } },
          { style: { flexGrow: 1 } },
          { style: { flexGrow: 1 } },
        ]}
        childrenLabels={childrenLabels}
        defaultViews={currentView}
      >
        <OrdersList
          selectedId={id}
          onAddElement={() => setOpenAddModal(true)}
        />

        <ApiEntryEditable template={template} entryName={"orders"} id={id} />
        {sheets.map((table_data, index) => (
          <EditableTable
            value={table_data}
            onSubmit={(data) => {
              data &&
                setSheets((val) =>
                  val.map((val, i) => (i === index ? data : val))
                )
              console.log(data)
            }}
            key={uuid + index}
          />
        ))}
      </Workspace>
      <Modal
        opened={openAddModal}
        onClose={() => setOpenAddModal(false)}
        size="xl"
      >
        <SimpleGrid cols={2} mt="md">
          <Button
            style={{ height: "unset", aspectRatio: "1.5/1" }}
            size="xl"
            variant="gradient"
            gradient={{ from: "teal", to: "lime", deg: 105 }}
          >
            <Stack p="xl" align="center">
              <CirclePlus size={52} />
              <Text style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
                Stwórz czyste zamówienie.
              </Text>
            </Stack>
          </Button>
          <Button
            style={{
              height: "unset",
              aspectRatio: "1.5/1",
            }}
            size="xl"
            variant="gradient"
            gradient={{ from: "indigo", to: "teal", deg: 105 }}
          >
            <Stack p="xl" align="center">
              <Mail size={52} />
              <Text style={{ whiteSpace: "pre-wrap", textAlign: "center" }}>
                Stwórz zamówienie z maila.
              </Text>
            </Stack>
          </Button>
        </SimpleGrid>
      </Modal>
    </>
  )
}

export default OrdersPage
