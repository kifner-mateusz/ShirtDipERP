import Editable from "@/components/editable/Editable";
import EditableAddress from "@/components/editable/EditableAddress";
import EditableApiEntry from "@/components/editable/EditableApiEntry";
import EditableArray from "@/components/editable/EditableArray";
import EditableDate from "@/components/editable/EditableDate";
import EditableDateTime from "@/components/editable/EditableDateTime";
import EditableDebugInfo from "@/components/editable/EditableDebugInfo";
import EditableEnum from "@/components/editable/EditableEnum";
import EditableFiles from "@/components/editable/EditableFiles";
import EditableNumber from "@/components/editable/EditableNumber";
import EditableRichText from "@/components/editable/EditableRichText";
import EditableShortText from "@/components/editable/EditableShortText";
import EditableSwitch from "@/components/editable/EditableSwitch";
import Button from "@/components/ui/Button";
import Wrapper from "@/components/ui/Wrapper";
import { useLoaded } from "@/hooks/useLoaded";
import { ProductType } from "@/schema/productSchema";
import { UserType } from "@/schema/userSchema";
import { api } from "@/utils/api";
import { truncString } from "@/utils/truncString";
import { IconAddressBook, IconCash, IconRefresh } from "@tabler/icons-react";
import { clientListSearchParams } from "../client/ClientList";
import ClientListItem from "../client/ClientListItem";
import ProductListItem from "../product/ProductListItem";
import UserListItem from "../user/UserListItem";

interface OrderEditableProps {
  id: number | null;
}

function OrderEditable(props: OrderEditableProps) {
  const { id } = props;
  const isLoaded = useLoaded();

  const { data, refetch } = api.order.getById.useQuery(id as number, {
    enabled: id !== null,
  });
  const { mutateAsync: update } = api.order.update.useMutation({
    onSuccess: () => {
      refetch().catch((err) => console.log(err));
    },
  });
  const { mutateAsync: deleteById } = api.order.deleteById.useMutation();

  const apiUpdate = (key: string, val: any) => {
    if (!isLoaded) return;
    if (!data) return;
    update({ id: data.id, [key]: val });
  };

  if (!data)
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        Brak danych
      </div>
    );

  return (
    <Editable data={data} onSubmit={apiUpdate}>
      <EditableDebugInfo label="ID: " keyName="id" />
      <Wrapper
        keyName="name" // hint for Editable
        wrapperClassName="flex gap-2 items-center"
        wrapperRightSection={
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => {
              refetch();
            }}
          >
            <IconRefresh />
          </Button>
        }
      >
        <EditableShortText
          keyName="name"
          required
          style={{ fontSize: "1.4em" }}
        />
      </Wrapper>
      <EditableEnum
        label="Status"
        keyName="status"
        enum_data={[
          "planned",
          "accepted",
          "in production",
          "wrapped",
          "sent",
          "rejected",
          "archived",
        ]}
      />
      <EditableRichText label="Notatki" keyName="notes" />
      <EditableShortText
        keyName="price"
        label="Cena"
        leftSection={<IconCash />}
      />
      <EditableSwitch keyName="isPricePaid" label="Cena zapłacona" />
      <EditableDate keyName="dateOfCompletion" label="Data ukończenia" />
      <EditableFiles keyName="files" label="Pliki" />
      <EditableApiEntry
        keyName="client"
        entryName="client"
        linkEntry
        allowClear
        listProps={clientListSearchParams}
        Element={ClientListItem}
      />
      <EditableAddress
        label={{
          streetName: "Ulica",
          streetNumber: "Nr. bloku",
          apartmentNumber: "Nr. mieszkania",
          secondLine: "Dodatkowe dane adresata",
          city: "Miasto",
          province: "Województwo",
          postCode: "Kod pocztowy",
          name: "Address",
        }}
        keyName="address"
        leftSection={<IconAddressBook />}
      />

      <EditableArray<ProductType> label="Produkty" keyName="products">
        <EditableApiEntry
          linkEntry
          entryName="product"
          Element={ProductListItem}
          copyProvider={(value: ProductType) =>
            value?.name ? truncString(value.name, 40) : undefined
          }
          allowClear
        />
      </EditableArray>
      <EditableArray<UserType> label="Pracownicy" keyName="employees">
        <EditableApiEntry
          linkEntry
          entryName="user"
          Element={UserListItem}
          copyProvider={(value: any) =>
            value?.username ? truncString(value.username, 40) : undefined
          }
          allowClear
        />
      </EditableArray>

      <EditableNumber
        label="Całkowity czas pracy"
        min={0}
        increment={1}
        fixed={0}
        keyName="workTime"
      />

      <EditableDateTime
        keyName="createdAt"
        label="Utworzono"
        disabled
        collapse
      />
      <EditableDateTime
        keyName="updatedAt"
        label="Edytowano"
        disabled
        collapse
      />
    </Editable>
  );
}

export default OrderEditable;