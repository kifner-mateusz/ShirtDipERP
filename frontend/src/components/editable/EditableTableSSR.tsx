import {
  Button,
  Group,
  Menu,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
  Input,
  Divider,
  ScrollArea,
} from "@mantine/core"
import React, {
  ComponentType,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react"
import { useTranslation } from "../../i18n"

// Icons
import { ScreenShare, Trash } from "tabler-icons-react"
import TableCenterIcon from "../icons/TableCenterIcon"
import TableEdgeIcon from "../icons/TableEdgeIcon"

// Spreadsheet Imports
import Spreadsheet from "react-spreadsheet"
import type {
  CellComponent,
  ColumnIndicatorComponent,
  CornerIndicatorComponent,
  Matrix,
  Point,
  RowIndicatorComponent,
} from "react-spreadsheet"
import RowIndicator, {
  enhance as enhanceRowIndicator,
} from "../spreadsheet/RowIndicator"
import ColumnIndicator, {
  enhance as enhanceColumnIndicator,
} from "../spreadsheet/ColumnIndicator"
import CornerIndicator from "../spreadsheet/CornerIndicator"
import { Cell, enhance as enhanceCell } from "../spreadsheet/Cell"
import DataViewer from "../spreadsheet/DataViewer"
import {
  UniversalMatrix,
  useSpreadSheetData,
} from "../spreadsheet/useSpreadSheetData"
import DataEditorDisabled from "../spreadsheet/DataEditorDisabled"

import { SxBackground } from "../../styles/basic"
import { getRandomColorByNumber } from "../../utils/getRandomColor"

interface EditableTableProps {
  label?: string
  value?: Matrix<any>
  initialValue?: Matrix<any>
  onSubmit?: (value: Matrix<any> | null) => void
  disabled?: boolean
  required?: boolean
  metadataIcons?: ComponentType[]
  metadataLabels?: string[]
  metadata: {
    [key: string]: {
      id: number
      [key: string]: any
    }
  }
  metadataActions: ((
    table: UniversalMatrix,
    metaId: number
  ) => [UniversalMatrix, string])[]
  metadataActionIcons: ComponentType[]
  metadataActionLabels?: string[]
}

const EditableTable = (props: EditableTableProps) => {
  const {
    label,
    value,
    initialValue,
    onSubmit,
    disabled,
    required,
    metadataIcons,
    metadataLabels,
    metadata,
    metadataActions,
    metadataActionIcons,
    metadataActionLabels,
  } = props
  const [statusText, setStatusText] = useState<string>("")
  const uuid = useId()
  const theme = useMantineTheme()
  const [openedColumn, setOpenedColumn] = useState<boolean>(false)
  const [openedRow, setOpenedRow] = useState<boolean>(false)
  const [contextPositionAndValue, setContextPositionAndValue] = useState<
    [number, number, number]
  >([0, 0, -1])
  const { t } = useTranslation()
  // const [data, setData] = useState<Matrix<any>>()
  const [
    data,
    {
      setData,
      addColumn,
      removeColumn,
      addRow,
      removeRow,
      clearMetadata,
      setMetadata,
    },
  ] = useSpreadSheetData(
    value ??
      initialValue ?? [
        [undefined, undefined],
        [undefined, undefined],
      ]
  )
  const [selection, setSelection] = useState<Point[]>([])
  const [updateCount, setUpdateCount] = useState<number>(0)
  const [canUpdate, setCanUpdate] = useState<boolean>(true)
  const [fullscreen, setFullscreen] = useState<boolean>(false)
  const incrementUpdateCount = () => setUpdateCount((count) => count + 1)

  const setDataWhenNEQ = (new_data: UniversalMatrix) => {
    let eq = true
    if (
      new_data.length === data.length &&
      new_data[0].length === data[0].length
    ) {
      for (let y = 0; y < data.length; y++) {
        for (let x = 0; x < data[0].length; x++) {
          if (
            new_data[y][x]?.value !== data[y][x]?.value ||
            new_data[y][x]?.metaId !== data[y][x]?.metaId ||
            new_data[y][x]?.metaPropertyId !== data[y][x]?.metaPropertyId
          ) {
            eq = false
          }
        }
      }
    } else {
      eq = false
    }

    if (!eq) {
      setData(new_data)
    }
  }

  const darkTheme = theme.colorScheme === "dark"

  const setSelectionIfNotNull = (value: Point[]) => {
    value.length != 0 && setSelection(value)
  }

  const setMetadataOnSelection = (metadata: { [key: string]: any }) => {
    setMetadata(selection, metadata)
    incrementUpdateCount()
    setSelection([])
  }
  const clearMetadataOnSelection = () => {
    clearMetadata(selection)
    incrementUpdateCount()
    setSelection([])
  }

  const onContextmenuColumn = (
    e: React.MouseEvent<HTMLDivElement>,
    column: number
  ) => {
    e.preventDefault()
    if (disabled) return
    if (!openedColumn) {
      setOpenedColumn(true)
      setContextPositionAndValue([e?.pageX, e?.pageY, column])
    } else {
      setOpenedColumn(false)
    }
  }

  const onContextmenuRow = (
    e: React.MouseEvent<HTMLDivElement>,
    row: number
  ) => {
    e.preventDefault()
    if (disabled) return
    if (!openedColumn) {
      setOpenedRow(true)
      setContextPositionAndValue([e?.pageX, e?.pageY, row])
    } else {
      setOpenedColumn(false)
    }
  }

  useEffect(() => {
    if (updateCount > 0 && canUpdate) {
      let eq = true
      if (
        value &&
        value.length === data.length &&
        value[0].length === data[0].length
      ) {
        for (let y = 0; y < data.length; y++) {
          for (let x = 0; x < data[0].length; x++) {
            if (
              value[y][x]?.value !== data[y][x]?.value ||
              value[y][x]?.metaId !== data[y][x]?.metaId ||
              value[y][x]?.metaPropertyId !== data[y][x]?.metaPropertyId
            ) {
              eq = false
            }
          }
        }
      } else {
        eq = false
      }

      if (!eq) {
        onSubmit && onSubmit(data)
        setUpdateCount(0)
      }
    }
  }, [updateCount, canUpdate])

  useEffect(() => {}, [disabled])

  const enhancedColumnIndicator = useMemo(
    () =>
      enhanceColumnIndicator(
        ColumnIndicator,
        onContextmenuColumn
      ) as unknown as ColumnIndicatorComponent,
    [openedColumn]
  )

  const enhancedRowIndicator = useMemo(
    () =>
      enhanceRowIndicator(
        RowIndicator,
        onContextmenuRow
      ) as unknown as RowIndicatorComponent,
    [openedRow]
  )

  const enhancedCell = useMemo(
    () => enhanceCell(Cell, metadataIcons ?? []) as unknown as CellComponent,
    [metadataIcons]
  )

  const metadataActionsMemo = useMemo(() => metadataActions, [metadataActions])

  return (
    <Input.Wrapper label={label} required={required}>
      <Stack
        spacing={0}
        style={
          fullscreen
            ? {
                position: "absolute",
                top: 0,
                left: 0,
                // bottom: 0,
                right: 0,
                zIndex: 9999,
                height: "200vh",
                background: theme.colorScheme === "dark" ? "#000" : "#fff",
                overflow: "hidden",
              }
            : { height: "100%" }
        }
      >
        <Group
          py="xs"
          align="end"
          position="apart"
          sx={fullscreen ? SxBackground : undefined}
          style={{ display: disabled ? "none" : undefined }}
          className="Spreadsheet__controls"
        >
          <Group p={0} align="end">
            {/*Column Menu*/}
            <Menu
              withinPortal
              opened={openedColumn}
              position="bottom-end"
              onChange={setOpenedColumn}
              closeOnEscape={true}
              closeOnItemClick={true}
              closeOnClickOutside={true}
              styles={{
                dropdown: {
                  position: "absolute",
                  top: contextPositionAndValue[1],
                  left: contextPositionAndValue[0],
                },
              }}
            >
              <Menu.Dropdown onBlur={() => setOpenedColumn(false)}>
                <Menu.Item py={4}>
                  <Text color="grey" size="xs">
                    {t("close")}
                  </Text>
                </Menu.Item>
                <Menu.Item
                  icon={
                    <TableEdgeIcon
                      action_color={theme.colors.green[6]}
                      size={18}
                      stroke={1.2}
                      style={{ transform: "scale(-1)" }}
                    />
                  }
                  onClick={() => {
                    addColumn(contextPositionAndValue[2])
                    incrementUpdateCount()
                    setStatusText("Dodano kolumnę")
                  }}
                >
                  {t("add-column-left")}
                </Menu.Item>
                <Menu.Item
                  icon={
                    <TableEdgeIcon
                      action_color={theme.colors.green[6]}
                      size={18}
                      stroke={1.2}
                    />
                  }
                  onClick={() => {
                    addColumn(contextPositionAndValue[2] + 1)
                    incrementUpdateCount()
                    setStatusText("Dodano kolumnę")
                  }}
                >
                  {t("add-column-right")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  icon={
                    <TableCenterIcon
                      action_color={theme.colors.red[6]}
                      size={18}
                      stroke={1}
                      action_position="center"
                    />
                  }
                  onClick={() => {
                    removeColumn(contextPositionAndValue[2])
                    incrementUpdateCount()
                    setStatusText("Usunięto kolumnę")
                  }}
                >
                  {t("remove-column")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            {/*Row Menu*/}
            <Menu
              withinPortal
              opened={openedRow}
              position="bottom-end"
              onChange={setOpenedRow}
              closeOnEscape={true}
              closeOnItemClick={true}
              closeOnClickOutside={true}
              styles={{
                dropdown: {
                  position: "absolute",
                  top: contextPositionAndValue[1],
                  left: contextPositionAndValue[0],
                },
              }}
            >
              <Menu.Dropdown onBlur={() => setOpenedRow(false)}>
                <Menu.Item py={4}>
                  <Text color="grey" size="xs">
                    {t("close")}
                  </Text>
                </Menu.Item>
                <Menu.Item
                  icon={
                    <TableEdgeIcon
                      action_color={theme.colors.green[6]}
                      size={18}
                      stroke={1.2}
                      style={{ transform: "rotate(-90deg)" }}
                    />
                  }
                  component="button"
                  onClick={() => {
                    addRow(contextPositionAndValue[2])
                    incrementUpdateCount()
                    setStatusText("Dodano wiersz")
                  }}
                >
                  {t("add-row-top")}
                </Menu.Item>
                <Menu.Item
                  icon={
                    <TableEdgeIcon
                      action_color={theme.colors.green[6]}
                      size={18}
                      stroke={1.2}
                      style={{ transform: "rotate(90deg)" }}
                    />
                  }
                  onClick={() => {
                    addRow(contextPositionAndValue[2] + 1)
                    incrementUpdateCount()
                    setStatusText("Dodano wiersz")
                  }}
                >
                  {t("add-row-bottom")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  icon={
                    <TableCenterIcon
                      action_color={theme.colors.red[6]}
                      size={18}
                      stroke={1.2}
                      style={{ transform: "rotate(-90deg)" }}
                      action_position="center"
                    />
                  }
                  onClick={() => {
                    removeRow(contextPositionAndValue[2])
                    incrementUpdateCount()
                    setStatusText("Usunięto wiersz")
                  }}
                >
                  {t("remove-row")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {metadata &&
              Object.keys(metadata).map((key, bgIndex) => (
                <div key={uuid + "_" + bgIndex}>
                  <Input.Wrapper label={key}>
                    <Group>
                      <Button.Group>
                        {metadataIcons &&
                          metadataIcons.map((Icon, index) => (
                            <Tooltip
                              label={metadataLabels?.[index]}
                              m={0}
                              withinPortal
                              key={uuid + "_" + bgIndex + "_" + index}
                              openDelay={500}
                            >
                              <Button
                                variant="default"
                                p={0}
                                size="xs"
                                style={{
                                  backgroundColor:
                                    getRandomColorByNumber(metadata[key].id) +
                                    "88",
                                }}
                                onClick={() => {
                                  setMetadataOnSelection({
                                    metaId: metadata[key].id,
                                    metaPropertyId: index,
                                  })
                                  setStatusText("Ustawiono metadane")
                                  incrementUpdateCount()
                                }}
                              >
                                {Icon && <Icon />}
                              </Button>
                            </Tooltip>
                          ))}
                      </Button.Group>
                      <Button.Group>
                        {metadataActionIcons &&
                          metadataActionIcons.map((Icon, index) => (
                            <Tooltip
                              label={metadataActionLabels?.[index]}
                              m={0}
                              withinPortal
                              key={uuid + "_" + bgIndex + "_action_" + index}
                              openDelay={500}
                            >
                              <Button
                                variant="default"
                                p={0}
                                size="xs"
                                style={{
                                  backgroundColor:
                                    getRandomColorByNumber(metadata[key].id) +
                                    "88",
                                }}
                                onClick={() => {
                                  metadataActionsMemo[index] &&
                                    setData((data) => {
                                      const [new_data, status] =
                                        metadataActionsMemo[index](
                                          data,
                                          metadata[key].id
                                        )
                                      setStatusText(status)
                                      return new_data
                                    })
                                }}
                              >
                                {Icon && <Icon />}
                              </Button>
                            </Tooltip>
                          ))}
                      </Button.Group>
                    </Group>
                  </Input.Wrapper>

                  <Divider orientation="vertical" />
                </div>
              ))}

            <Tooltip label={t("clear") as string}>
              <Button
                variant="default"
                p={0}
                size="xs"
                onClick={() => {
                  clearMetadataOnSelection()
                  incrementUpdateCount()
                  setStatusText("Usunięto metadane")
                }}
              >
                <Trash />
              </Button>
            </Tooltip>
          </Group>
          <Group p={0} align="end">
            <Tooltip label={t("fullscreen") as string}>
              <Button
                variant="default"
                p={0}
                size="xs"
                onClick={() => {
                  setFullscreen((fullscreen) => !fullscreen)
                }}
              >
                <ScreenShare />
              </Button>
            </Tooltip>
          </Group>
        </Group>
        <ScrollArea type="auto">
          <Spreadsheet
            data={data}
            onChange={(data) => {
              setDataWhenNEQ(data)
              incrementUpdateCount()
            }}
            onSelect={setSelectionIfNotNull}
            darkMode={darkTheme}
            Cell={enhancedCell}
            className="Spreadsheet"
            ColumnIndicator={enhancedColumnIndicator}
            RowIndicator={enhancedRowIndicator}
            CornerIndicator={
              CornerIndicator as unknown as CornerIndicatorComponent
            }
            onModeChange={(mode) => {
              setCanUpdate(mode === "view")
            }}
            onCellCommit={() => setCanUpdate(true)}
            DataViewer={DataViewer}
            DataEditor={disabled ? DataEditorDisabled : undefined}
          />
        </ScrollArea>
        <Text
          color={
            statusText.startsWith("error")
              ? "red"
              : statusText.startsWith("success")
              ? "green"
              : "gray"
          }
        >
          {statusText || "⸺"}
        </Text>
      </Stack>
    </Input.Wrapper>
  )
}

export default EditableTable