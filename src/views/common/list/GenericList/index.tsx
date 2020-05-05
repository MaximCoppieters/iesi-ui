import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {
    IListItem,
    ListColumns,
    IListAction,
    ISortedColumn,
    ListFilters,
} from 'models/list.models';
import {
    TableCell,
    Typography,
    Theme,
} from '@material-ui/core';
import {
    Pagination,
    PaginationItem,
} from '@material-ui/lab';
import sortListItems from 'utils/list/sortListItems';
import { filterListItems } from 'utils/list/filters';
import { TObjectWithProps } from 'models/core.models';
import AppTemplateContainer from 'views/appShell/AppTemplateContainer';
import Translate from '@snipsonian/react/es/components/i18n/Translate';
import GenericTableRow from './GenericTableRow';

const ROWS_PER_PAGE = 5;

interface IPublicProps<ColumnNames> {
    columns: ListColumns<ColumnNames>;
    listItems: IListItem<ColumnNames>[];
    listActions?: IListAction[];
    sortedColumn?: ISortedColumn<ColumnNames>;
    filters?: ListFilters<Partial<ColumnNames>>;
    enablePagination?: boolean;
}

const useStyles = makeStyles(({ palette, spacing, shape }: Theme) => ({
    table: {
        // Padding for box shadows of tableRows
        paddingTop: spacing(2.2),
        paddingBottom: spacing(2.2),
        paddingLeft: spacing(5),
        paddingRight: spacing(5),
        minWidth: 650,
        tableLayout: 'auto',
        borderCollapse: 'separate',
        borderSpacing: `0 ${spacing(1)}px`,
        background: palette.background.default,
        '& .MuiTableCell-root': {
            borderBottomWidth: 0,
            '&:first-child': {
                borderTopLeftRadius: shape.borderRadius,
                borderBottomLeftRadius: shape.borderRadius,
            },
            '&:last-child': {
                borderTopRightRadius: shape.borderRadius,
                borderBottomRightRadius: shape.borderRadius,
            },
        },
    },
    paginationSelected: {
        backgroundColor: `${palette.primary.main} !important`,
        color: palette.background.paper,
    },
}));

export default function GenericList<ColumnNames>({
    listItems,
    columns,
    listActions,
    sortedColumn,
    filters,
    enablePagination,
}: IPublicProps<ColumnNames>) {
    const [page, setPage] = React.useState(1);
    const classes = useStyles();

    const items = sortedColumn
        ? sortListItems(listItems, sortedColumn as ISortedColumn<{}>)
        : listItems;

    const filteredItems = filters
        ? filterListItems(items, filters as TObjectWithProps)
        : items;

    const startIndexToShowBasedOnPage = (page - 1) * ROWS_PER_PAGE;
    const itemsToDisplay = enablePagination
        ? filteredItems.slice(startIndexToShowBasedOnPage, startIndexToShowBasedOnPage + ROWS_PER_PAGE)
        : filteredItems;

    if (isPageHigherThanAmountOfFilteredItems() && page !== 1) {
        setPage(1);
    }

    return (
        <>
            <TableContainer elevation={0} component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableBody>
                        {itemsToDisplay.length === 0 && (
                            <TableRow>
                                <TableCell>
                                    <Typography>
                                        <Translate msg="common.list.no_results" />
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {itemsToDisplay.map((item: IListItem<ColumnNames>) => (
                            <GenericTableRow
                                key={item.id}
                                item={item}
                                listActions={listActions}
                                columns={columns}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {enablePagination && (
                <AppTemplateContainer>
                    <Pagination
                        count={Math.ceil(filteredItems.length / ROWS_PER_PAGE)}
                        shape="rounded"
                        onChange={handleChangePage}
                        page={page}
                        showFirstButton
                        showLastButton
                        renderItem={(props) => (
                            <PaginationItem
                                {...props}
                                classes={{ selected: classes.paginationSelected }}
                            />
                        )}
                    />
                </AppTemplateContainer>
            )}
        </>
    );

    function handleChangePage(event: React.ChangeEvent<unknown> | null, newPage: number) {
        setPage(newPage);
    }

    function isPageHigherThanAmountOfFilteredItems() {
        return startIndexToShowBasedOnPage > filteredItems.length;
    }
}
