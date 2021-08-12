import { blue, lightGreen } from '@material-ui/core/colors';
import { createTheme, ThemeOptions } from '@material-ui/core/styles';


const themeOptions: ThemeOptions = {
    palette: {
        primary: blue,
        secondary: lightGreen,
    },
    overrides: {
        MuiAccordionSummary: {
            root: {
                '&$expanded': {
                    minHeight: 0,
                    maxHeight: 30,
                    paddingTop: 10
                },
                minHeight: 0
            }
        },
        MuiToolbar: {
            regular: {
                minHeight: 48,
                '@media(min-width:600px)' : {
                    minHeight: 48
                }
            }
        },
        MuiTabs: {
            root: {
                minHeight: 30,
                maxHeight: 30
            }
        },
        MuiTab: {
            root: {
                minHeight: 30,
                maxHeight: 30,
                padding: '6px 0px'
            }
        }
        // MuiTableCell: {
        //     root: {  //This can be referred from Material UI API documentation. 
        //         padding: '4px 8px',
        //         backgroundColor: "#fafafa",
        //     }
        // },
    },
}

const theme = createTheme(themeOptions);

export default theme;