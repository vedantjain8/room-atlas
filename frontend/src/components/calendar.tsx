// https://nextui.org/docs/components/date-picker#unavailable-dates
// TODO: mark date as unavailable if it is already booked
"use client";
import React, { useState } from "react";
import {
  now,
  getLocalTimeZone,
  today,
  ZonedDateTime,
} from "@internationalized/date";
import { Button, DatePicker, Input } from "@nextui-org/react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "./calendarModal";
import { Calendar } from "lucide-react";
interface CalendarPageProps {
  senderid: number;
  receiverid: number;
}

const CalendarPage: React.FC<CalendarPageProps> = ({
  senderid,
  receiverid,
}) => {
  let url;
  const [dateState, setDateState] = useState<ZonedDateTime>(
    now(getLocalTimeZone())
  );

  return (
    <>
      <Modal>
        <ModalTrigger className="bg-sky-600 dark:bg-white dark:text-black text-white flex justify-center group/modal-btn rounded-xl items-start">
          <span className="text-md md:text-md group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Calendar
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            <Calendar />
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
            <div className="flex gap-4 mt-8 items-center flex-col">
              <DatePicker
                label="eventDate"
                className="w-full"
                variant="bordered"
                minValue={today(getLocalTimeZone())}
                showMonthAndYearPickers
                hideTimeZone
                defaultValue={now(getLocalTimeZone())}
                onChange={(date) => {
                  setDateState(date);
                }}
              />
              <Input label="Description" type="text" className="w-full" />
            </div>
          </ModalContent>
          <ModalFooter className="gap-4">
            <a target="_blank" href={url}>
              <Button
                onClick={async () => {
                  const response = await fetch(
                    `
              ${process.env.NEXT_PUBLIC_HOSTNAME}/calendar/new`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        date: dateState,
                        senderid: 1, //TODO: change this
                        receiverid: 1,
                      }),
                    }
                  );

                  const data = await response.json();
                  console.log(data);
                }}
              >
                Add to google calendar
              </Button>
            </a>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </>
  );
};
export default CalendarPage;
