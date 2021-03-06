import React from 'react';
import { Button, IconButton, Box, makeStyles, Paper, darken } from '@material-ui/core';
import {
    AddRounded as AddIcon,
    Save as SaveIcon,
    Delete as DeleteIcon,
    PlayArrowRounded as PlayIcon,
} from '@material-ui/icons';
import ReportIcon from 'views/common/icons/Report';
import Translate from '@snipsonian/react/es/components/i18n/Translate';
import { THEME_COLORS } from 'config/themes/colors';
import Tooltip from 'views/common/tooltips/Tooltip';
import { observe, IObserveProps } from 'views/observe';
import { StateChangeNotification } from 'models/state.models';
import { getTranslator } from 'state/i18n/selectors';

interface IPublicProps {
    onPlay: () => void;
    onDelete: () => void;
    onAdd: () => void;
    onSave: () => void;
    onViewReport: () => void;
    isCreateRoute?: boolean;
}

const useStyles = makeStyles(({ palette, spacing }) => ({
    actions: {
        padding: `${spacing(0.5)}px ${spacing(1)}px`,
        backgroundColor: palette.type === 'light'
            ? THEME_COLORS.GREY_LIGHT
            : darken(THEME_COLORS.GREY_DARK, 0.2),
        '& .MuiIconButton-root': {
            padding: spacing(0.8),
            margin: `${spacing(0.2)}px ${spacing(0.5)}px`,
        },
    },
    addButton: {
        backgroundColor: palette.type === 'light'
            ? THEME_COLORS.GREY_LIGHT
            : darken(THEME_COLORS.GREY_DARK, 0.2),
    },
}));

function DetailActions({
    onPlay,
    onDelete,
    onAdd,
    onSave,
    onViewReport,
    isCreateRoute,
    state,
}: IPublicProps & IObserveProps) {
    const classes = useStyles();
    const translator = getTranslator(state);

    const DeleteButton = (
        <IconButton
            disabled={isCreateRoute}
            aria-label={translator('scripts.detail.main.actions.delete')}
            onClick={onDelete}
        >
            <DeleteIcon />
        </IconButton>
    );

    const ReportButton = (
        <IconButton
            disabled={isCreateRoute}
            aria-label={translator('scripts.detail.main.actions.report')}
            onClick={onViewReport}
        >
            <ReportIcon />
        </IconButton>
    );

    const ExecuteButton = (
        <IconButton
            disabled={isCreateRoute}
            aria-label={translator('scripts.detail.main.actions.execute')}
            onClick={onPlay}
        >
            <PlayIcon />
        </IconButton>
    );

    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" marginX={2.2}>
            <Box flex="0 0 auto">
                <Tooltip
                    title={translator('scripts.detail.main.actions.add_action')}
                    enterDelay={1000}
                    enterNextDelay={1000}
                >
                    <IconButton
                        aria-label={translator('scripts.detail.main.actions.add_action')}
                        className={classes.addButton}
                        onClick={onAdd}
                        color="default"
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box flex="0 0 auto">
                <Paper elevation={0} className={classes.actions}>
                    <Box display="inline" marginRight={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={onSave}
                        >
                            <Translate msg="scripts.detail.main.actions.save" />
                        </Button>
                    </Box>
                    {isCreateRoute ? (
                        <>
                            {DeleteButton}
                            {ReportButton}
                            {ExecuteButton}
                        </>
                    ) : (
                        <>
                            <Tooltip
                                title={translator('scripts.detail.main.actions.delete')}
                                enterDelay={1000}
                                enterNextDelay={1000}
                            >
                                {DeleteButton}
                            </Tooltip>
                            <Tooltip
                                title={translator('scripts.detail.main.actions.report')}
                                enterDelay={1000}
                                enterNextDelay={1000}
                            >
                                {ReportButton}
                            </Tooltip>
                            <Tooltip
                                title={translator('scripts.detail.main.actions.execute')}
                                enterDelay={1000}
                                enterNextDelay={1000}
                            >
                                {ExecuteButton}
                            </Tooltip>
                        </>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}

export default observe<IPublicProps>([
    StateChangeNotification.I18N_TRANSLATIONS,
], DetailActions);
