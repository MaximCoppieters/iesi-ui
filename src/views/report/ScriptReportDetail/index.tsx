import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { parseISO, format as formatDate } from 'date-fns/esm';
import isSet from '@snipsonian/core/es/is/isSet';
import isEmptyObject from '@snipsonian/core/es/object/isEmptyObject';
import { Box, makeStyles, Button, Typography } from '@material-ui/core';
import { ChevronLeftRounded } from '@material-ui/icons';
import { Alert, AlertTitle } from '@material-ui/lab';
import Translate from '@snipsonian/react/es/components/i18n/Translate';
import useExecuteOnUnmount from 'utils/hooks/useExecuteOnUnmount';
import DescriptionList, { IDescriptionListItem } from 'views/common/list/DescriptionList';
import { ROUTE_KEYS, redirectTo } from 'views/routes';
import ContentWithSidePanel from 'views/common/layout/ContentWithSidePanel/index';
import StatusIcon from 'views/common/icons/StatusIcon';
import { getAsyncExecutionRequestDetail } from 'state/entities/executionRequests/selectors';
import { observe, IObserveProps } from 'views/observe';
import Loader from 'views/common/waiting/Loader';
import { AsyncStatus, AsyncOperation } from 'snipsonian/observable-state/src/actionableStore/entities/types';
import { StateChangeNotification } from 'models/state.models';
import { getTranslator } from 'state/i18n/selectors';
import { IExecutionRequest } from 'models/state/executionRequests.models';
import { IScriptExecutionDetailAction } from 'models/state/scriptExecutions.models';
import {
    triggerFetchScriptExecutionDetail,
    triggerResetScriptExecutionDetail,
} from 'state/entities/scriptExecutions/triggers';
import { getAsyncScriptExecutionDetail } from 'state/entities/scriptExecutions/selectors';
import { ListColumns, IListItem, ISortedColumn, SortOrder, SortType } from 'models/list.models';
import { THEME_COLORS } from 'config/themes/colors';
import sortListItems from 'utils/list/sortListItems';
import ScriptExecutionDetailActions from './ScriptExecutionDetailActions';
import ShowLabels from './ShowLabels';
import { IExecutionDetailPathParams } from './shared';

interface IColumnNames {
    processId: number;
    name: string;
    description: string;
}

const useStyles = makeStyles(({ palette, typography }) => ({
    processId: {
        display: 'none',
    },
    scriptName: {
        fontWeight: typography.fontWeightBold,
        color: palette.primary.main,
    },
    scriptDescription: {
        fontWeight: typography.fontWeightBold,
        '&:after': {
            display: 'none',
        },
    },
    status: {
        '& > .MuiSvgIcon-root': {
            fontSize: typography.pxToRem(20),
        },
    },
    statusError: {
        '& > .MuiSvgIcon-root': {
            color: THEME_COLORS.ERROR,
        },
    },
    statusSuccess: {
        '& > .MuiSvgIcon-root': {
            color: THEME_COLORS.SUCCESS,
        },
    },
    statusWarning: {
        '& > .MuiSvgIcon-root': {
            color: THEME_COLORS.WARNING,
        },
    },
}));

function ExecutionDetail({ state }: IObserveProps) {
    const classes = useStyles();
    const { executionRequestId, runId, processId } = useParams<IExecutionDetailPathParams>();

    const asyncExecutionRequest = getAsyncExecutionRequestDetail(state).fetch;
    const executionRequestDetail = getAsyncExecutionRequestDetail(state).data || {} as IExecutionRequest;

    const asyncScriptExecutionData = getAsyncScriptExecutionDetail(state).fetch;
    const scriptExecutionData = getAsyncScriptExecutionDetail(state).data;

    useEffect(() => {
        if (
            !runId
                && asyncExecutionRequest.status === AsyncStatus.Success
                && executionRequestDetail.scriptExecutionRequests.length > 0
                && executionRequestDetail.scriptExecutionRequests[0].runId
        ) {
            redirectTo({
                routeKey: ROUTE_KEYS.R_REPORT_DETAIL,
                params: {
                    executionRequestId: executionRequestDetail.executionRequestId,
                    runId: executionRequestDetail.scriptExecutionRequests[0].runId,
                },
            });
        }
        return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [asyncExecutionRequest]);

    useEffect(() => {
        if (
            asyncExecutionRequest.status === AsyncStatus.Success
                && asyncScriptExecutionData.status !== AsyncStatus.Busy
                && (!isSet(scriptExecutionData)
                    || scriptExecutionData.runId !== runId
                    || (processId && scriptExecutionData.processId !== parseInt(processId, 10)))
                && runId
        ) {
            triggerFetchScriptExecutionDetail({
                runId,
                processId: processId ? parseInt(processId, 10) : -1,
            });
        }
        return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scriptExecutionData, runId, processId, asyncExecutionRequest]);

    useExecuteOnUnmount({
        execute: () => {
            triggerResetScriptExecutionDetail({ operation: AsyncOperation.fetch, resetDataOnTrigger: true });
        },
    });

    const isLoading = asyncExecutionRequest.status === AsyncStatus.Busy
        || asyncScriptExecutionData.status === AsyncStatus.Busy
        || (asyncExecutionRequest.status === AsyncStatus.Success
                && asyncScriptExecutionData.status === AsyncStatus.Initial);

    return (
        <>
            <Loader show={isLoading} />
            <ContentWithSidePanel
                panel={renderDetailPanel()}
                content={renderDetailContent()}
                goBackTo={ROUTE_KEYS.R_REPORTS}
                toggleLabel={<Translate msg="script_reports.detail.side.toggle_button" />}
            />
        </>
    );

    function renderDetailContent() {
        if (asyncExecutionRequest.error || asyncScriptExecutionData.error) {
            return (
                <div>
                    <Alert severity="error">
                        <AlertTitle><Translate msg="script_reports.detail.main.error.title" /></AlertTitle>
                        <Translate msg="script_reports.detail.main.error.text" />
                    </Alert>
                </div>
            );
        }

        if (!runId) {
            return (
                <div>
                    <Alert severity="info">
                        <AlertTitle><Translate msg="script_reports.detail.main.no_run_data.title" /></AlertTitle>
                        <Translate msg="script_reports.detail.main.no_run_data.text" />
                    </Alert>
                </div>
            );
        }

        if (scriptExecutionData && asyncExecutionRequest.status === AsyncStatus.Success) {
            const listItems = mapActionsToListItemsAndSortByProcessId(scriptExecutionData.actions);
            const columns: ListColumns<IColumnNames> = {
                processId: {
                    className: classes.processId,
                },
                name: {
                    fixedWidth: '40%',
                    className: classes.scriptName,
                },
                description: {
                    fixedWidth: '50%',
                    className: classes.scriptDescription,
                },
            };

            const parentProcessId = scriptExecutionData.processId !== scriptExecutionData.parentProcessId
                ? scriptExecutionData.parentProcessId
                : undefined;

            return (
                <Box marginY={1}>
                    <Box marginBottom={3}>
                        {typeof parentProcessId !== 'undefined' && (
                            <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                startIcon={<ChevronLeftRounded />}
                                onClick={() => redirectTo({
                                    routeKey: ROUTE_KEYS.R_REPORT_DETAIL,
                                    params: {
                                        executionRequestId,
                                        runId,
                                        processId: parentProcessId,
                                    },
                                })}
                            >
                                <Translate msg="script_reports.detail.main.action.go_to_parent_script_detail" />
                            </Button>
                        )}
                    </Box>
                    <ScriptExecutionDetailActions
                        listItems={listItems}
                        columns={columns}
                    />
                </Box>
            );
        }

        return null;
    }

    function renderDetailPanel() {
        const translator = getTranslator(state);

        if (asyncExecutionRequest.error || isEmptyObject(executionRequestDetail)) {
            return null;
        }

        const executionListItems: IDescriptionListItem[] = [
            ...(scriptExecutionData && asyncExecutionRequest.status === AsyncStatus.Success) ? [
                {
                    label: translator('script_reports.detail.side.execution.script_name.label'),
                    value: scriptExecutionData.scriptName,
                },
                {
                    label: translator('script_reports.detail.side.execution.script_version.label'),
                    value: scriptExecutionData.scriptVersion,
                },
                {
                    label: translator('script_reports.detail.side.execution.environment.label'),
                    value: scriptExecutionData.environment,
                },
                {
                    label: translator('script_reports.detail.side.execution.script_status.label'),
                    value: (
                        <StatusIcon
                            status={scriptExecutionData.status}
                            label={scriptExecutionData.status}
                        />
                    ),
                },
                {
                    label: translator('script_reports.detail.side.execution.timestamps.label'),
                    value: `${formatDate(
                        parseISO(scriptExecutionData.startTimestamp.toString()),
                        'dd/MM/yyyy HH:mm:ss',
                    )} - ${scriptExecutionData.endTimestamp ? formatDate(
                        parseISO(scriptExecutionData.endTimestamp.toString()),
                        'dd/MM/yyyy HH:mm:ss',
                    ) : '?'}`,
                },
                {
                    label: translator('script_reports.detail.side.execution.run_id.label'),
                    value: scriptExecutionData.runId,
                },
                {
                    label: translator('script_reports.detail.side.execution.process_id.label'),
                    value: scriptExecutionData.processId,
                },
                {
                    label: translator('script_reports.detail.side.execution.input_parameters.label'),
                    value: scriptExecutionData.inputParameters.length
                        ? <ShowLabels labels={scriptExecutionData.inputParameters} />
                        : <Translate msg="script_reports.detail.side.execution.input_parameters.none" />,
                },
                {
                    label: translator('script_reports.detail.side.execution.output.label'),
                    value: scriptExecutionData.output.length
                        ? (
                            <ShowLabels
                                labels={scriptExecutionData.output.sort((a, b) => a.name.localeCompare(b.name))}
                            />
                        ) : <Translate msg="script_reports.detail.side.execution.output.none" />,
                },
                {
                    label: translator('script_reports.detail.side.execution.execution_labels.label'),
                    value: scriptExecutionData.executionLabels.length
                        ? <ShowLabels labels={scriptExecutionData.executionLabels} />
                        : <Translate msg="script_reports.detail.side.execution.execution_labels.none" />,
                },
                {
                    label: translator('script_reports.detail.side.execution.design_labels.label'),
                    value: scriptExecutionData.designLabels.length
                        ? <ShowLabels labels={scriptExecutionData.designLabels} />
                        : <Translate msg="script_reports.detail.side.execution.design_labels.none" />,
                },
            ] : [],
        ];

        return (
            <Box mt={1} display="flex" flexDirection="column" flex="1 1 auto">
                <Box flex="0 1 auto" marginBottom={3}>
                    <Typography variant="h4">
                        <Translate msg="script_reports.detail.side.execution.title" />
                    </Typography>
                    <DescriptionList items={executionListItems} noLineAfterListItem />
                </Box>
            </Box>
        );
    }

    function mapActionsToListItemsAndSortByProcessId(items: IScriptExecutionDetailAction[]) {
        const listItems = items.map((item) => {
            const listItem: IListItem<IColumnNames> = {
                id: `${item.runId}-${item.processId}`,
                columns: {
                    processId: item.processId,
                    name: item.name,
                    description: item.description,
                },
                data: {
                    processId: item.processId,
                    runId: item.runId,
                    status: item.status,
                    inputParameters: item.inputParameters,
                    type: item.type,
                    startTimestamp: item.startTimestamp,
                    endTimestamp: item.endTimestamp,
                    errorExpected: item.errorExpected,
                    errorStop: item.errorStop,
                    condition: item.condition,
                    output: item.output.sort((a, b) => a.name.localeCompare(b.name)),
                },
            };
            return listItem;
        });

        return sortListItems(listItems, {
            name: 'processId',
            sortOrder: SortOrder.Ascending,
            sortType: SortType.Number,
        } as ISortedColumn<{}>);
    }
}

export default observe([
    StateChangeNotification.EXECUTION_REQUESTS_DETAIL,
    StateChangeNotification.EXECUTION_REQUESTS_DETAIL,
    StateChangeNotification.SCRIPT_EXECUTION_DETAIL,
    StateChangeNotification.I18N_TRANSLATIONS,
], ExecutionDetail);
