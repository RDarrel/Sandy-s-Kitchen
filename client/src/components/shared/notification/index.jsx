import { useEffect, useState } from "react";
import { Bell, CheckCheck, Inbox, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  BROWSE,
  MARK_ALL_AS_READ,
  MARK_AS_READ,
} from "@/services/redux/slices/events/notifications";
import { NOTIFICATION_TEMPLATES, NOTIFICATION_TYPES } from "./constant";
import { formatNotificationTime } from "./utils";
import { useNavigate } from "react-router-dom";

export default function NotificationPopover() {
  const { auth } = useSelector(({ auth }) => auth);
  const {
    collections: notifications,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useSelector(({ notifications }) => notifications);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState(null);
  const isMarking = isMarkingAsRead || isMarkingAllAsRead;

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  useEffect(() => {
    dispatch(BROWSE({ userId: auth?._id }));
  }, [dispatch, auth]);

  const visibleNotifications = notifications.slice(0, 5);

  const markAsRead = (_id, reference) => {
    setMarkingNotificationId(_id);
    dispatch(MARK_AS_READ({ _id }))
      .unwrap()
      .then(() => {
        setIsOpen(false);
        navigate(`/platforms/my-bookings/${reference}`);
      })
      .catch((error) => {
        console.log("error", error);
      })
      .finally(() => {
        setMarkingNotificationId(null);
      });
  };

  const markAllAsRead = () => {
    dispatch(MARK_ALL_AS_READ({ userId: auth?._id }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "relative mr-4 size-9 shrink-0 rounded-lg border border-primary/15 shadow-none transition-colors [&_svg]:size-[19px]",
            unreadCount > 0
              ? "bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90"
              : "border-border bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
          aria-label={`Open notifications, ${unreadCount} unread`}
        >
          <Bell aria-hidden="true" strokeWidth={1.75} />

          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-1.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold tabular-nums text-accent-foreground ring-2 ring-background"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={4}
        collisionPadding={16}
        className="w-[calc(100vw-2rem)] max-w-[400px] overflow-hidden rounded-xl border-border bg-popover p-0 shadow-lg"
      >
        {/* Header */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  <span className="sr-only">Unread: </span>
                  {unreadCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0 || isMarking}
              aria-busy={isMarkingAllAsRead}
              onClick={markAllAsRead}
              className="h-7 shrink-0 gap-1 rounded-md px-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
            >
              {isMarkingAllAsRead ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCheck className="size-3.5" aria-hidden="true" />
              )}
              {isMarkingAllAsRead ? "Marking all read..." : "Mark all read"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Notification List */}
        <ScrollArea className="[&>[data-orientation=vertical]]:w-2 [&>[data-radix-scroll-area-viewport]]:h-auto [&>[data-radix-scroll-area-viewport]]:max-h-[min(360px,50dvh)]">
          {visibleNotifications.length > 0 ? (
            <div className="divide-y divide-border/50">
              {visibleNotifications.map((notification) => {
                const template = NOTIFICATION_TEMPLATES[notification?.type];

                const config =
                  NOTIFICATION_TYPES[template.variant] ||
                  NOTIFICATION_TYPES.info;
                const Icon = config.icon;
                const isMarkingNotification =
                  isMarkingAsRead && markingNotificationId === notification._id;

                return (
                  <button
                    key={notification._id}
                    type="button"
                    disabled={isMarking}
                    aria-busy={isMarkingNotification}
                    onClick={() =>
                      markAsRead(notification._id, notification.reference)
                    }
                    className={cn(
                      "flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      !notification.isRead ? "bg-muted/15" : "bg-transparent",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                        config.className,
                      )}
                    >
                      {isMarkingNotification ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          <span className="sr-only">Marking as read...</span>
                        </>
                      ) : (
                        <Icon className="size-4" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={cn(
                            "min-w-0 text-[13px] leading-5",
                            notification.isRead
                              ? "font-medium text-foreground/80"
                              : "font-semibold text-foreground",
                          )}
                        >
                          {template.title}
                        </p>
                        <span className="shrink-0 text-[10px] leading-4 text-muted-foreground">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] font-medium leading-4 tracking-wide text-muted-foreground">
                        <span className="sr-only">Booking reference: </span>
                        {notification?.reference}
                      </p>
                      <div className="mt-0.5 flex items-start gap-2">
                        <p className="line-clamp-2 min-w-0 flex-1 text-xs leading-4 text-muted-foreground">
                          {template.message}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary">
                            <span className="sr-only">Unread</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[min(180px,50dvh)] flex-col items-center justify-center gap-4 px-6 py-6 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">No notifications yet</p>

                <p className="text-xs text-muted-foreground">
                  Your booking updates will appear here.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
