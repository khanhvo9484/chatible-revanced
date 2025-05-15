export enum TEXT_COMMAND {
  GET_STARTED = "GET_STARTED",
  FIND_MALE = "FIND_MALE",
  FIND_FEMALE = "FIND_FEMALE",
  FIND_OTHER = "FIND_OTHER",
  FIND_ALL = "FIND_ALL",
  END_CHAT = "END_CHAT",
}

export const STARTER_MESSAGE = {
  attachment: {
    type: "template",
    payload: {
      template_type: "button",
      text: "Bạn muốn trò chuyện với ai?",
      buttons: [
        {
          type: "postback",
          title: "Nam",
          payload: TEXT_COMMAND.FIND_MALE,
        },
        {
          type: "postback",
          title: "Nữ",
          payload: TEXT_COMMAND.FIND_FEMALE,
        },
        {
          type: "postback",
          title: "Khác",
          payload: TEXT_COMMAND.FIND_OTHER,
        },
      ],
    },
  },
};

export const QUICK_REPLY = {
  text: "Bạn muốn trò chuyện với ai?",
  quick_replies: [
    {
      content_type: "text",
      title: "Nam",
      payload: TEXT_COMMAND.FIND_MALE,
    },
    {
      content_type: "text",
      title: "Nữ",
      payload: TEXT_COMMAND.FIND_FEMALE,
    },
    {
      content_type: "text",
      title: "Khác",
      payload: TEXT_COMMAND.FIND_OTHER,
    },
    {
      content_type: "text",
      title: "Tất cả",
      payload: TEXT_COMMAND.FIND_ALL,
    },
  ],
};

export const PERSISTENT_MENU = {
  persistent_menu: [
    {
      locale: "default",
      composer_input_disabled: false,
      call_to_actions: [
        {
          type: "postback",
          title: "Bắt đầu trò chuyện",
          payload: TEXT_COMMAND.GET_STARTED,
        },
        {
          type: "postback",
          title: "Kết thúc trò chuyện",
          payload: TEXT_COMMAND.END_CHAT,
        },
      ],
    },
  ],
};

export const TEXT_RESPONSES = {
  WAITING_FOR_PARTNER: "Đang tìm kiếm... Vui lòng đợi trong giây lát.",
  NO_PARTNER_FOUND: "Không tìm thấy người dùng nào phù hợp.",
  FOUND_PARTNER: "Đã tìm thấy người dùng phù hợp. Bắt đầu trò chuyện nào!",
  ERRORS: {
    END_CHAT: {
      NO_PARTNER: "Không thể kết thúc trò chuyện. Bạn chưa có đối tác nào.",
      NO_SESSION:
        "Không thể kết thúc trò chuyện. Bạn chưa có phiên trò chuyện nào.",
      CAN_NOT_END_SESSION: "Không thể kết thúc phiên trò chuyện.",
    },
    CANNOT_CREATE_SESSION: "Không thể tạo phiên trò chuyện.",
  },
  END_CHAT: {
    SELF_END: "Đã kết thúc trò chuyện.",
    PARTNER_END: "Đối tác đã kết thúc trò chuyện.",
  },
};
