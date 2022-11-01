import { List } from "@mantine/core"
import _ from "lodash"
import { useRouter } from "next/router"
import { Mail } from "tabler-icons-react"
import Workspace from "../../../components/layout/Workspace"
import { EmailProvider } from "../../../context/emailContext"
import { getQueryAsIntOrNull } from "../../../utils/nextQueryUtils"
import EmailMessagesList from "./EmailMessagesList"
import EmailMessagesView from "./EmailMessageView"

const entryName = "email-client/messages"

const EmailMessagesPage = () => {
  const router = useRouter()
  const id = getQueryAsIntOrNull(router, "id")
  const currentView = id ? [0, 1] : 0

  return (
    <EmailProvider>
      <Workspace
        childrenLabels={id ? ["Lista email", "Treść"] : ["Lista email"]}
        childrenIcons={[List, Mail]}
        defaultActive={id ? 1 : 0}
      >
        <EmailMessagesList selectedId={id} />
        <EmailMessagesView id={id} />
      </Workspace>
    </EmailProvider>
  )
}

export default EmailMessagesPage
