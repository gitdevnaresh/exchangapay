import React from 'react';
import ParagraphComponent from '../paragraphText/paragraph';
import { dateFormates, formatDates, formatUTCtoLocalDate } from '../../../utils/helpers';
// Assuming dateUtils is the file containing the formatDates function

interface FormattedDateProps {
  value: string | Date;
  style?: any;
  dateFormat?: string; // The format string passed to formatDates or formatUTCtoLocalDate
  conversionType?: 'UTC-to-local' | 'Normal-to-formatted'; // Type of date conversion
}

export const FormattedDateText: React.FC<FormattedDateProps> = ({
  value,
  style,
  dateFormat = dateFormates.dateTimeWithSeconds, // Default format if not provided
  conversionType = 'Normal-to-formatted', // Default conversion type
}) => {
  if (!value) {
    return <ParagraphComponent style={style} text="--" />;
  }

  let formattedDate = '';

  // Handle conversion type
  if (conversionType === 'UTC-to-local') {
    formattedDate = formatUTCtoLocalDate(value, dateFormat); // Convert UTC to local formatted date
  } else {
    formattedDate = formatDates(value, dateFormat); // Convert normal date to formatted date
  }

  return <ParagraphComponent style={style} text={formattedDate} />;
};
