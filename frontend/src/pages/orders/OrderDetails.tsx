import { FC, useEffect, useState } from "react";
import { message } from "antd";

import axios from "axios";
import Logger from "js-logger";
import { useQuery } from "react-query";

import EditComponent from "../../components/EditComponent";
import { OrderType } from "../../types/OrderType";
import ErrorPage from "../ErrorPage";

interface OrderDetailsProps {
  orderId?: number;
  template: any;
  onUpdate?: () => void;
}

const fetchOrder = async (id: number | undefined) => {
  if (!id) return;
  const res = await axios.get(`/orders/${id}`);
  return res.data;
};

const OrderDetails: FC<OrderDetailsProps> = ({
  orderId,
  template,
  onUpdate,
}) => {
  const [order, setOrder] = useState<OrderType>();
  const [newTemplate, setNewTemplate] = useState<any>();

  const { data, refetch } = useQuery(["order_one", orderId], () =>
    fetchOrder(orderId)
  );

  useEffect(() => {
    if (!data) return;
    setOrder(data);
  }, [data]);

  useEffect(() => {
    let new_template = { ...template };
    order &&
      Object.keys(order).forEach((key) => {
        // @ts-ignore
        if (order[key] != null) new_template[key].value = order[key];
        else new_template[key].value = new_template[key].initialValue;
      });
    setNewTemplate(new_template);
  }, [template, order]);

  const onSubmit = (sub_data: Partial<OrderType>) => {
    axios
      .put(`/orders/${sub_data.id}`, sub_data)
      .then((res) => {
        Logger.info({ ...res, message: "Edycja zamowienia udana" });
        message.success("Edycja zamówienia udana");
        setOrder(res.data);
        onUpdate && onUpdate();
        refetch();
      })
      .catch((e) => {
        Logger.error({ ...e, message: "Błąd edycji zamówienia" });
      });
  };

  const onArchive = (id: number) => {
    axios
      .get(`/orders/archive/${id}`)
      .then((res) => {
        Logger.info({ ...res, message: "Archiwizacja zamowienia udana" });
        message.success("Archiwizacja zamówienia udana");
        setOrder(undefined);
        onUpdate && onUpdate();
      })
      .catch((e) => {
        Logger.error({ ...e, message: "Błąd archiwizacji zamówienia" });
      });
  };

  return (
    <div>
      {order ? (
        <EditComponent
          data={newTemplate}
          onSubmit={onSubmit}
          title="name"
          onDelete={onArchive}
          deleteTitle="Archiwizuj zamówienie"
        />
      ) : (
        <ErrorPage errorcode={404} />
      )}
    </div>
  );
};

export default OrderDetails;
