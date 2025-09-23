from langchain_openai import ChatOpenAI , OpenAI , OpenAIEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain import output_parsers
from langchain_core.output_parsers import StrOutputParser , PydanticOutputParser
from typing import Literal
from pydantic import BaseModel , Field
from dotenv import load_dotenv 

load_dotenv()


model = ChatOpenAI()

str_parser = StrOutputParser()
user_input = "hello"
while user_input != "exit":
    user_input=input("please state your feedback : ")

    class Feedback(BaseModel):
        sentiment:Literal['positive','negitive','neutral'] = Field(description="give the sentiment of the feedback")

    prompt1 = PromptTemplate(
        template="{feedbacks}",
        input_variables={'feedback'}
    )

    chain = analysis_chain = prompt1 | model | str_parser

    result = chain.invoke({'feedbacks':'i hope we never work again'})

    print(result)