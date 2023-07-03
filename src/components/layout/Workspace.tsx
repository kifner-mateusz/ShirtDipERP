import { Group, Menu, Text } from "@mantine/core"
import { useElementSize, useMediaQuery } from "@mantine/hooks"
import { useRouter } from "next/router"
import {
  Children,
  ComponentType,
  ReactNode,
  useId,
  useState,
  MouseEvent,
} from "react"
import { useTranslation } from "../../i18n"
import { useAuthContext } from "../../context/authContext"
import {
  getQueryAsArray,
  getQueryAsIntOrNull,
  setQuery,
} from "../../utils/nextQueryUtils"

import ResponsivePaper from "../ResponsivePaper"
import MultiTabs from "./MultiTabs"

interface WorkspaceProps {
  childrenWrapperProps?: any[]
  childrenLabels?: string[]
  childrenIcons?: ComponentType<any & { size?: number }>[]
  children?: ReactNode
  defaultActive?: number
  defaultPinned?: number[]
  leftMenuSection?: ReactNode
  rightMenuSection?: ReactNode
}

const Workspace = ({
  children,
  childrenLabels = [],
  childrenIcons = [],
  childrenWrapperProps = [null],
  defaultActive = 1,
  defaultPinned = [0],
  leftMenuSection,
  rightMenuSection,
}: WorkspaceProps) => {
  const { isSmall, hasTouch } = useAuthContext()
  const isMobile = hasTouch || isSmall
  const [menuPosition, setMenuPosition] = useState<[number, number]>([0, 0])
  const [menuOpened, setMenuOpen] = useState<boolean>(false)
  const uuid = useId()
  const router = useRouter()
  if (
    typeof router?.query?.pinned !== "string" ||
    typeof router?.query?.active !== "string"
  ) {
    setQuery(router, {
      pinned: defaultPinned,
      active: defaultActive,
    })
  }

  const { t } = useTranslation()
  const pinned = getQueryAsArray(router, "pinned")
    .map((val) => (isNaN(parseInt(val)) ? null : parseInt(val)))
    .filter((value) => value !== null) as number[]

  const active = getQueryAsIntOrNull(router, "active") ?? undefined

  const child_array = Children.toArray(children)

  const { navigationCollapsed, toggleNavigationCollapsed, debug } =
    useAuthContext()
  const { ref, width } = useElementSize()

  const activeTabs = isMobile ? [] : [...pinned]
  if (active !== undefined && !activeTabs.includes(active))
    activeTabs.push(active)

  // useEffect(() => {
  //   if (!childrenLabels) return
  //   let new_arr = [...pinned]
  //   if (active && !pinned.includes(active)) new_arr.push(active)
  //   let index_arr = new_arr.map((val) => childrenLabels?.indexOf(val))
  //   setQuery(router, {
  //     show_views: index_arr.map((val) => val.toString()),
  //   })
  // }, [pinned, active])

  const openMenu = (e: MouseEvent<any, any>) => {
    setMenuPosition(isMobile ? [width / 2, 60] : [e.pageX, e.pageY])
    setMenuOpen(true)
  }

  return (
    <Group
      ref={ref}
      sx={(theme) => ({
        flexWrap: "nowrap",
        alignItems: "flex-start",
        padding: theme.spacing.md,
        [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
          padding: 4,
        },
        overflow: "hidden",
      })}
    >
      <MultiTabs
        active={active}
        onTabChange={(value) =>
          setQuery(router, {
            pinned,
            active: value,
          })
        }
        pinned={pinned}
        onPin={(value) =>
          setQuery(router, {
            pinned: pinned.includes(value)
              ? pinned.filter((val2) => val2 !== value)
              : [...pinned, value],
            active: active === undefined ? value : active,
          })
        }
        childrenLabels={childrenLabels}
        childrenIcons={childrenIcons}
        availableSpace={width}
        rightSection={rightMenuSection}
        leftSection={leftMenuSection}
      />
      {children &&
        activeTabs.map((childIndex, index) => (
          <ResponsivePaper
            {...(childrenWrapperProps &&
            childrenWrapperProps[childIndex] !== undefined
              ? childrenWrapperProps[childIndex]
              : { style: { flexGrow: 1 } })}
            key={uuid + index}
          >
            {child_array[childIndex]}
          </ResponsivePaper>
        ))}
    </Group>
  )
}

export default Workspace