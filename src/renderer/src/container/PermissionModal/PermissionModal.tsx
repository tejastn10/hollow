import { App, Form, Input, type InputRef, Modal } from "antd";
import { type FC, useEffect, useRef, useState } from "react";

import { MAX_PASSWORD_ATTEMPTS } from "./constants";

const { Password } = Input;

interface Props {
	visible: boolean;

	errorMessage?: string;

	onCancel: () => void;
	onSubmit: (password: string) => void;
}

const PermissionModal: FC<Props> = ({ visible, errorMessage, onCancel, onSubmit }) => {
	const [form] = Form.useForm();
	const { message } = App.useApp();

	const autoFocusRef = useRef<InputRef>(null);

	const [attempts, setAttempts] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);

	const onModalOpen = (open?: boolean): void => {
		if (open) {
			autoFocusRef.current?.focus();
		}
	};

	const handleCancel = () => {
		onCancel();

		form.resetFields();

		setAttempts(0);
		setIsProcessing(false);
	};

	const handleSubmit = async ({ password }: { password: string }) => {
		try {
			setIsProcessing(true);

			if (password) {
				onSubmit(password);
				return;
			}

			throw new Error("No password detected!");
		} catch (error) {
			console.error(`Error submitting password. Error ${JSON.stringify(error, null, 2)}`);
			message.error("Failed to submit password. Please try again");
		} finally {
			setTimeout(() => {
				setIsProcessing(false);
			}, 1000);
		}
	};

	useEffect(() => {
		if (visible) {
			form.resetFields();

			setAttempts(0);
		}
	}, [visible, form]);

	useEffect(() => {
		if (errorMessage) {
			setAttempts((prev) => prev + 1);

			message.error(errorMessage);
			form.setFields([
				{
					name: "password",
					errors: [errorMessage],
				},
			]);
		}
	}, [errorMessage, message, form]);

	return (
		<Modal
			title="Administrator Password Required"
			open={visible}
			onOk={form.submit}
			onCancel={handleCancel}
			okText="Submit"
			cancelText="Cancel"
			destroyOnHidden
			afterOpenChange={onModalOpen}
			confirmLoading={isProcessing}
		>
			<Form form={form} onFinish={handleSubmit} layout="vertical">
				<Form.Item
					name="password"
					label="Please enter your administrator password to enable real packet capture:"
					rules={[
						{ required: true, message: "Password is required" },
						{
							validator: async (_, value) => {
								if (attempts >= MAX_PASSWORD_ATTEMPTS && value) {
									throw new Error("Too many failed attempts. Please try again later...");
								}
							},
						},
					]}
					validateStatus={attempts > 0 ? "error" : undefined}
					help={attempts > 0 ? `Failed attempts: ${attempts}/${MAX_PASSWORD_ATTEMPTS}` : undefined}
				>
					<Password
						autoFocus
						ref={autoFocusRef}
						onPressEnter={form.submit}
						placeholder="Enter your password"
						disabled={attempts >= MAX_PASSWORD_ATTEMPTS}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export { PermissionModal };
