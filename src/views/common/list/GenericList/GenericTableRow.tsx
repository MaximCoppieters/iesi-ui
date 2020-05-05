import React from 'react';
import { getListItemValueFromColumn } from 'utils/list/list';
import {
    TableCell,
    Typography,
    IconButton,
    Theme,
    Box,
    Tooltip,
    Icon,
    makeStyles,
    TableRow,
} from '@material-ui/core';
import {
    IListItem,
    ListColumns,
    IColumn,
    IListAction,
} from 'models/list.models';
import {
    Info,
} from '@material-ui/icons';

const SHORTEN_VALUE_FROM_CHARACTERS = 40;

interface IPublicProps<ColumnNames> {
    item: IListItem<ColumnNames>;
    columns: ListColumns<ColumnNames>;
    listActions?: IListAction[];
}

const useStyles = makeStyles(({ palette, shape }: Theme) => ({
    tableRow: {
        background: palette.background.paper,
        boxShadow: '0 2px 22px rgba(0, 0, 0, .10)',
        borderRadius: shape.borderRadius,
    },
    label: {
        fontSize: '.8rem',
        color: palette.grey[500],
    },
    action: {
        width: 50,
    },
    actionIcon: {
        color: palette.primary.dark,
    },
}));

export default function GenericTableRow<ColumnNames>({
    item,
    columns,
    listActions,
}: IPublicProps<ColumnNames>) {
    const classes = useStyles();
    return (
        <TableRow className={classes.tableRow}>
            {Object.keys(columns).map((untypedColumnName) => {
                const columnName = (untypedColumnName as unknown) as keyof ColumnNames;
                const column = columns[columnName] as IColumn<ColumnNames>;

                const value = getListItemValueFromColumn(item, columnName).toString();
                const shortenedValue = value.length > SHORTEN_VALUE_FROM_CHARACTERS
                    ? `${value.substr(0, SHORTEN_VALUE_FROM_CHARACTERS)}...`
                    : value;

                const className = typeof column.className === 'function'
                    ? column.className(value)
                    : column.className;

                const tooltip = typeof column.tooltip === 'function'
                    ? column.tooltip(value)
                    : column.tooltip;

                return (
                    <TableCell style={{ width: column.fixedWidth }} key={columnName as string}>
                        <Typography
                            display="block"
                            className={classes.label}
                        >
                            {column.label}
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <Typography className={className}>
                                {shortenedValue}
                            </Typography>
                            {tooltip && (
                                <Box marginLeft={1}>
                                    <Tooltip title={tooltip}>
                                        <Icon aria-label="info">
                                            <Info />
                                        </Icon>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    </TableCell>
                );
            })}
            {listActions && listActions.map((action, index) => (
                <TableCell // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    align="right"
                    className={classes.action}
                >
                    <IconButton
                        onClick={() => action.onClick(item.id)}
                        className={classes.actionIcon}
                    >
                        {action.icon}
                    </IconButton>
                </TableCell>
            ))}
        </TableRow>
    );
}
