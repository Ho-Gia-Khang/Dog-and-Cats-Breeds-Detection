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
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case MessageSeverity.WARNING:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case MessageSeverity.ERROR:
        return 'bg-red-100 border-red-300 text-red-800'
      case MessageSeverity.SUCCESS:
        return 'bg-green-100 border-green-300 text-green-800'
      case MessageSeverity.PRIMARY:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  return (
    <div className={`${getSeverityClass()} p-1 w-full border-2 rounded-md`}>
      {message}
    </div>
  )
}

export default Message
