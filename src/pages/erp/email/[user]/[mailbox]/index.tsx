import MultiTabs from "@/components/layout/MultiTabs/MultiTabs";
import { Tab } from "@/components/layout/MultiTabs/Tab";
import EmailFolderTree from "@/page-components/erp/email/EmailFolderTree";
import EmailList from "@/page-components/erp/email/EmailList";
import EmailSendModal from "@/page-components/erp/email/EmailSendModal";
import ErrorPage from "@/pages/_error";
import { api } from "@/utils/api";
import { getQueryAsStringOrNull } from "@/utils/query";
import { IconMail } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useId, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface EmailMailboxProps {}

function EmailMailbox(props: EmailMailboxProps) {
  const {} = props;
  const router = useRouter();
  const { user } = router.query;
  const uuid = useId();
  const mailbox: string = (
    getQueryAsStringOrNull(router, "mailbox") ?? "INBOX"
  ).replace("-", "/");
  const { data: emailClients, isLoading } = api.email.getAllConfigs.useQuery(
    undefined,
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
  const [refreshCounter, setRefreshCounter] = useState(0); // this is hack
  const [openSendModal, setOpenSendModal] = useState<boolean>(false);

  const emailClientsIMAP = emailClients
    ? emailClients.filter((client) => client.protocol === "imap")
    : [];
  const emailClientsSMTP = emailClients
    ? emailClients.filter((client) => client.protocol === "smtp")
    : [];

  const emailConfig = emailClientsIMAP.filter(
    (emailClient) => emailClient.user === user,
  )[0];
  if (emailConfig === undefined) return <ErrorPage statusCode={404} />;

  const currentIMAPuser =
    emailClientsIMAP
      .map((val, index) => (val.user === user ? index : null))
      .filter((v) => v !== null)[0] ?? 0;

  const setActive: Dispatch<SetStateAction<number>> = (value) => {
    const active = typeof value == "function" ? value(currentIMAPuser) : value;

    active !== undefined &&
      router.push(`/erp/email/${emailClientsIMAP[active]?.user}/INBOX`);
  };

  return (
    <div className="flex flex-grow flex-nowrap items-start gap-4 overflow-hidden p-1 sm:p-4">
      <MultiTabs
        active={currentIMAPuser}
        setActive={setActive}
        // rightSection={
        //   <Tab
        //     className="p-2"
        //     onClick={() => setOpenSendModal(true)}
        //   >
        //     <IconPencil />
        //   </Tab>
        // }
      >
        {emailClientsIMAP.map((val, index) => (
          <Tab key={`${uuid}${index}`} leftSection={<IconMail />}>
            {val.user}
          </Tab>
        ))}
      </MultiTabs>

      <div className="relative flex w-40 min-w-[10rem] flex-col rounded bg-white shadow-lg dark:bg-stone-800">
        <ErrorBoundary
          fallback={
            <h1>
              EmailFolderView encountered irreparable error and crashed, please
              reload page.
            </h1>
          }
        >
          <EmailFolderTree
            emailConfig={emailConfig}
            onActive={(mailbox) =>
              router.push(
                `/erp/email/${user}/${
                  mailbox ? mailbox.replace("/", "-") : "INBOX"
                }`,
              )
            }
          />
        </ErrorBoundary>
      </div>
      <div className="relative flex min-h-[16rem] flex-grow flex-col rounded bg-white shadow-lg dark:bg-stone-800">
        <ErrorBoundary
          fallback={
            <h1>
              EmailList encountered irreparable error and crashed, please reload
              page.
            </h1>
          }
        >
          <EmailList
            key={`${uuid}${refreshCounter}`}
            emailConfig={emailConfig}
            mailbox={mailbox}
            onSelect={(uid) =>
              router.push(
                `/erp/email/${user}/${
                  mailbox ? mailbox.replace("/", "-") : "INBOX"
                }/${uid}`,
              )
            }
          />
        </ErrorBoundary>
      </div>
      <EmailSendModal
        opened={openSendModal}
        onClose={(id?: number) => {
          setOpenSendModal(false);
          id !== undefined &&
            router
              .push(
                `/erp/email/${user}/${
                  mailbox ? mailbox.replace("/", "-") : "INBOX"
                }`,
              )
              .catch((e) => {
                throw e;
              });
        }}
      />
    </div>
  );
}

export default EmailMailbox;