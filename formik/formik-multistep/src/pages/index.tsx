import {Box, Button, Card, CardContent, CircularProgress, Grid, Step, StepLabel, Stepper} from '@material-ui/core';
import React, {useState} from "react";
import {Field, Form, Formik, FormikConfig, FormikValues} from "formik";
import {CheckboxWithLabel, TextField} from "formik-material-ui";
import {mixed, number, object, string} from "yup"

const sleep = time => {
    return new Promise((acc) => setTimeout(acc, time))
}

const millionaireValidationSchema = object({
    money: mixed().when("millionaire", {
        is: true,
        then: number().required().min(1_000_000, "Because you said you are a millionaire you need to have 1 million"),
        otherwise: number().required()
    })
})

const nameValidationSchema = object({
    firstName: string().required(),
    lastName: string().required()
})

export interface FormikStepProps extends Pick<FormikConfig<FormikValues>, "children" | "validationSchema"> {
    label: string

}

export function FormikStep({children}: FormikStepProps) {
    return <>{children}</>
}


export default function Home() {
    return (
        <Card>
            <CardContent>
                <FormikStepper initialValues={{
                    firstName: "",
                    lastName: "",
                    millionaire: false,
                    money: 0,
                    description: ""
                }}
                               onSubmit={async () => {
                                   await sleep(2000)
                               }}>
                    <FormikStep validationSchema={nameValidationSchema} label="Personal Info">
                        <Box paddingBottom={2}>
                            <Field fullWidth name="firstName" component={TextField} type="text" label="First Name"/>
                        </Box>
                        <Box paddingBottom={2}>
                            <Field fullWidth name="lastName" component={TextField} type="text" label="Last Name"/>
                        </Box>
                        <Box paddingBottom={2}>
                            <Field name="millionaire" component={CheckboxWithLabel} type="checkbox"
                                   Label={{label: "I am a millionaire"}}/>
                        </Box>
                    </FormikStep>
                    <FormikStep validationSchema={millionaireValidationSchema} label="Bank statement">
                        <Box paddingBottom={2}>
                            <Field fullWidth name="money" component={TextField} label="All the money I have"/>
                        </Box>
                    </FormikStep>
                    <FormikStep label="Additional Info">
                        <Box paddingBottom={2}>
                            <Field fullWidth name="description" component={TextField} label="Description"/>
                        </Box>
                    </FormikStep>
                </FormikStepper>
            </CardContent>
        </Card>
    );
}

export function FormikStepper({children, ...props}: FormikConfig<FormikValues>) {

    const childrenArray = React.Children.toArray(children) as React.ReactElement<FormikStepProps>[];
    const [step, setStep] = useState(0);
    const currentChild = childrenArray[step] as React.ReactElement<FormikStepProps>;
    const [completed, setCompleted] = useState(false);

    function isLastStep() {
        return step === childrenArray.length - 1
    }

    return (
        <Formik {...props}
                validationSchema={currentChild.props.validationSchema}
                onSubmit={async (values, helpers) => {
                    if (isLastStep()) {
                        await props.onSubmit(values, helpers);
                        setCompleted(true);
                        // helpers.resetForm();
                        // setStep(0);
                    } else {
                        setStep(s => s + 1);
                    }
                }}>{({isSubmitting}) => (

            <Form autoComplete={"off"}>
                <Stepper activeStep={step} alternativeLabel>
                    {childrenArray.map((child, index) => (
                        <Step key={child.props.label} completed={ step > index || completed}>
                            <StepLabel>{child.props.label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {currentChild}
                <Grid container spacing={2}>
                    {step > 0 ? (
                        <Grid item>
                            <Button disabled={isSubmitting} color="primary" variant="contained"
                                    onClick={() => setStep(s => s - 1)}>Back</Button></Grid>) : null
                    }
                    <Grid item>
                        <Button startIcon={isSubmitting? <CircularProgress size = {"1rem"} /> : null} disabled={isSubmitting} type="submit" color="primary"
                                variant="contained">{isSubmitting ? "Submitting..." : isLastStep() ? "Submit" : "Next"}</Button>
                    </Grid>
                </Grid>
            </Form>)}
        </Formik>);
}
