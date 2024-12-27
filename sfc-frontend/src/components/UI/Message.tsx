import React from 'react'
import { MessageSeverity } from '../../types/MessageSeverity'

const Message = ({
  message,
  severity = MessageSeverity.PRIMARY,
}: {
  message: string
  severity?: MessageSeverity
}) => {
  function getSeverityClass() {
    switch (severity) {
      case MessageSeverity.INFO:
        return 'bg-blue-100 text-blue-800'
      case MessageSeverity.WARNING:
        return 'bg-yellow-100 text-yellow-800'
      case MessageSeverity.ERROR:
        return 'bg-red-100 text-red-800'
      case MessageSeverity.SUCCESS:
        return 'bg-green-100 text-green-800'
      case MessageSeverity.PRIMARY:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return <div className={`${getSeverityClass()} p-1 w-full`}>{message}</div>
}

export default Message
