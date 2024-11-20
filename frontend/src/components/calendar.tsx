"use client";
import React, { use, useEffect, useState } from "react";
import {
  now,
  getLocalTimeZone,
  today,
  ZonedDateTime,
  DateValue,
  parseAbsolute,
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
import { io } from "socket.io-client";

interface CalendarPageProps {
  senderid: number;
  receiverid: number;
}

const CalendarPage: React.FC<CalendarPageProps> = ({
  senderid,
  receiverid,
}) => {
  let url;
  const socket = io(`${process.env.NEXT_PUBLIC_HOSTNAME}`);
  const [dateState, setDateState] = useState<ZonedDateTime>(
    now(getLocalTimeZone())
  );

  async function fetchAndAddDisabledRanges() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/calendar/busy/${receiverid}`
      ); // Replace with your actual API endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch event data");
      }

      const eventData = await response.json(); // Assuming the response is JSON
      const eventDates = eventData.message.map(
        (event: { event_start_date: string }) => {
          const eventStartDate = parseAbsolute(
            event.event_start_date,
            getLocalTimeZone()
          );
          const eventEndDate = eventStartDate.add({ hours: 2 }); // Example: Adding 2 hours as an end time
          return [eventStartDate, eventEndDate];
        }
      );

      // Add the fetched date ranges to `disabledRanges`
      disabledRanges = [...eventDates];
    } catch (error) {
      console.error("Error fetching or processing event data:", error);
    }
  }

  useEffect(() => {
    fetchAndAddDisabledRanges();
  }, []);

  let disabledRanges = [
    [
      // start date, end date
      now(getLocalTimeZone()).add({ days: 14 }),
      now(getLocalTimeZone()).add({ days: 16 }),
    ],
  ];

  let isDateUnavailable = (date: DateValue) => {
    if (disabledRanges.length === 0) return false;
    return disabledRanges.some(
      (interval) =>
        date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0
    );
  };

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
                isDateUnavailable={isDateUnavailable}
                onChange={(date) => {
                  setDateState(date);
                }}
              />
              <Input
                label="Description"
                type="text"
                className="w-full"
                id="Description"
              />
            </div>
          </ModalContent>
          <ModalFooter className="gap-4">
            <a target="_blank" href={url}>
              <Button
                onClick={async () => {
                  if (!senderid || !receiverid) return;
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_HOSTNAME}/calendar/new`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        date: dateState,
                        senderid,
                        receiverid,
                        message: (
                          document.getElementById(
                            "Description"
                          ) as HTMLInputElement
                        ).value,
                      }),
                    }
                  );

                  const data = await response.json();
                  socket.emit("chatMessage", {
                    sender: senderid,
                    receiver: receiverid,
                    message: data.url,
                  });
                }}
              >
                Add to google calendar
              </Button>
              <Button onClick={() => console.log(senderid, receiverid)}>
                yee
              </Button>
            </a>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </>
  );
};
export default CalendarPage;
